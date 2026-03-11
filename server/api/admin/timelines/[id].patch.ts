// PATCH /api/admin/timelines/:id — update timeline (link GitHub repo, change status, etc.)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const timelineId = getRouterParam(event, 'id')
  if (!timelineId) throw createError({ statusCode: 400, message: 'Missing timeline ID' })

  const body = await readBody(event)
  const { githubRepo, githubRepoId, status, startDate, endDate, milestones } = body

  const updateData: any = { updatedAt: new Date() }
  if (githubRepo !== undefined) updateData.githubRepo = githubRepo || null
  if (githubRepoId !== undefined) updateData.githubRepoId = githubRepoId ? Number(githubRepoId) : null
  if (status) updateData.status = status
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

  const timeline = await prisma.projectTimeline.update({
    where: { id: timelineId },
    data: updateData,
    include: { milestones: { orderBy: { order: 'asc' } } },
  })

  // Update individual milestone statuses or githubMilestoneIds if provided
  if (milestones && Array.isArray(milestones)) {
    await Promise.all(
      milestones.map((m: any) => {
        const mData: any = {}
        if (m.status) mData.status = m.status
        if (m.githubMilestoneId !== undefined) mData.githubMilestoneId = m.githubMilestoneId ? Number(m.githubMilestoneId) : null
        if (m.status === 'COMPLETED') mData.completedAt = new Date()
        if (!Object.keys(mData).length) return Promise.resolve()
        return prisma.projectMilestone.update({ where: { id: m.id }, data: mData })
      })
    )
  }

  return { success: true, timeline }
})
