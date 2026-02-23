export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const submissions = await prisma.submission.findMany({
    select: {
      industry: true,
      complexity: true,
      status: true,
      createdAt: true,
    },
  })

  const byIndustry = submissions.reduce((acc: any, sub) => {
    acc[sub.industry] = (acc[sub.industry] || 0) + 1
    return acc
  }, {})

  const byComplexity = submissions.reduce((acc: any, sub) => {
    acc[sub.complexity] = (acc[sub.complexity] || 0) + 1
    return acc
  }, {})

  const byStatus = submissions.reduce((acc: any, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1
    return acc
  }, {})

  const totalUsers = await prisma.user.count()
  const totalSubmissions = submissions.length
  const pendingSubmissions = await prisma.submission.count({
    where: { status: 'PENDING' },
  })

  return {
    totalUsers,
    totalSubmissions,
    pendingSubmissions,
    byIndustry,
    byComplexity,
    byStatus,
  }
})
