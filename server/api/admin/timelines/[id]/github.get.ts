// GET /api/admin/timelines/:id/github — live GitHub data for a linked repo
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const timelineId = getRouterParam(event, 'id')
  if (!timelineId) throw createError({ statusCode: 400, message: 'Missing timeline ID' })

  const timeline = await prisma.projectTimeline.findUnique({
    where: { id: timelineId },
    include: { milestones: { orderBy: { order: 'asc' } } },
  })
  if (!timeline) throw createError({ statusCode: 404, message: 'Timeline not found' })
  if (!timeline.githubRepo) throw createError({ statusCode: 400, message: 'No GitHub repo linked to this timeline' })

  const repo = timeline.githubRepo

  // Fetch all GitHub data in parallel — gracefully handle failures
  const [
    repoInfoResult,
    commitActivityResult,
    codeFrequencyResult,
    milestonesResult,
    languagesResult,
    commitsResult,
    releasesResult,
    prsResult,
    contributorsResult,
  ] = await Promise.allSettled([
    getRepoInfo(repo),
    getCommitActivity(repo),
    getCodeFrequency(repo),
    getRepoMilestones(repo),
    getRepoLanguages(repo),
    getRecentCommits(repo, 25),
    getRecentReleases(repo, 10),
    getPullRequests(repo, 'all'),
    getContributors(repo),
  ])

  const ok = <T>(r: PromiseSettledResult<T>): T | null =>
    r.status === 'fulfilled' ? r.value : null

  const repoInfo = ok(repoInfoResult)
  const ghMilestones = ok(milestonesResult) ?? []
  const ghPRs = ok(prsResult) ?? []

  const progress = calculateGitHubProgress(ghMilestones, repoInfo ?? undefined, ghPRs)

  // Merge DB milestones with their linked GitHub milestones
  const mergedMilestones = timeline.milestones.map(m => {
    const ghM = m.githubMilestoneId
      ? ghMilestones.find((gm) => gm.number === m.githubMilestoneId) ?? null
      : null
    return { ...m, github: ghM }
  })

  return {
    timeline: { ...timeline, milestones: mergedMilestones },
    github: {
      repo: repoInfo,
      progress,
      commitActivity: ok(commitActivityResult),   // null means still computing
      codeFrequency: ok(codeFrequencyResult),      // null means still computing
      milestones: ghMilestones,
      languages: ok(languagesResult) ?? {},
      recentCommits: ok(commitsResult) ?? [],
      releases: ok(releasesResult) ?? [],
      pullRequests: ghPRs,
      mergedPRs: ghPRs.filter(pr => pr.merged_at),
      contributors: ok(contributorsResult),         // null means still computing
    },
  }
})
