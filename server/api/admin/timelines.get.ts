// GET /api/admin/timelines — list all project timelines with submission info
export default defineEventHandler(async (event) => {
  try {
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
  } catch (error: any) {
    console.error('Timelines error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      message: 'Failed to load timelines',
      cause: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})
