export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return submissions
})
