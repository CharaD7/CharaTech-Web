// GET /api/timelines — client's own project timelines with live GitHub progress
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Get all submissions for this user
  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    select: { id: true, projectName: true },
  })
  if (!submissions.length) return []

  // Get timelines for those submissions
  const timelines = await prisma.projectTimeline.findMany({
    where: { submissionId: { in: submissions.map(s => s.id) } },
    include: { milestones: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })

  const subMap = Object.fromEntries(submissions.map(s => [s.id, s]))

  // Enrich with GitHub public data (safe to expose to client — only public repos)
  const enriched = await Promise.all(
    timelines.map(async (t) => {
      let githubProgress = 0
      let repoInfo = null
      let ghMilestones: any[] = []
      let recentCommits: any[] = []

      if (t.githubRepo) {
        try {
          const [info, milestones, commits] = await Promise.allSettled([
            getRepoInfo(t.githubRepo),
            getRepoMilestones(t.githubRepo),
            getRecentCommits(t.githubRepo, 5),
          ])
          if (info.status === 'fulfilled') repoInfo = info.value
          if (milestones.status === 'fulfilled') ghMilestones = milestones.value ?? []
          if (commits.status === 'fulfilled') recentCommits = (commits.value ?? []).map((c: any) => ({
            sha: c.sha.substring(0, 7),
            message: c.commit.message.split('\n')[0].substring(0, 72),
            author: c.author?.login ?? c.commit.author.name,
            avatar: c.author?.avatar_url ?? null,
            date: c.commit.author.date,
            url: c.html_url,
          }))
          githubProgress = calculateGitHubProgress(ghMilestones, repoInfo ?? undefined)
        } catch { /* ignore — client shouldn't see API errors */ }
      }

      // Fallback progress from DB milestone statuses
      const dbProgress = (() => {
        const ms = t.milestones
        if (!ms.length) return 0
        const done = ms.filter(m => m.status === 'COMPLETED').length
        return Math.round((done / ms.length) * 100)
      })()

      return {
        id: t.id,
        submissionId: t.submissionId,
        projectName: subMap[t.submissionId]?.projectName ?? 'Project',
        status: t.status,
        startDate: t.startDate,
        endDate: t.endDate,
        milestones: t.milestones,
        githubRepo: t.githubRepo,
        progress: t.githubRepo ? githubProgress : dbProgress,
        github: t.githubRepo ? {
          repoInfo,
          milestones: ghMilestones,
          recentCommits,
        } : null,
      }
    })
  )

  return enriched
})
