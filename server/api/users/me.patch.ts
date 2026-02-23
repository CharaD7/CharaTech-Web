export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: body.fullName,
      phoneNumber: body.phoneNumber,
      companyName: body.companyName,
    },
  })

  return updated
})
