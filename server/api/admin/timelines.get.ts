// GET /api/admin/timelines — list all project timelines with submission info
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const timelines = await prisma.projectTimeline.findMany({
    include: {
      milestones: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Enrich with submission data
  const submissionIds = timelines.map(t => t.submissionId)
  const submissions = await prisma.submission.findMany({
    where: { id: { in: submissionIds } },
    include: { user: { select: { fullName: true, email: true, companyName: true } } },
  })

  const subMap = Object.fromEntries(submissions.map(s => [s.id, s]))

  return timelines.map(t => ({
    ...t,
    submission: subMap[t.submissionId] ?? null,
    clientName: subMap[t.submissionId]?.user?.fullName ?? subMap[t.submissionId]?.user?.email ?? 'Unknown',
    projectName: subMap[t.submissionId]?.projectName ?? 'Untitled',
  }))
})
