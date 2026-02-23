export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const submission = await prisma.submission.update({
    where: { id },
    data: {
      status: body.status,
      reviewedAt: new Date(),
      reviewedBy: admin.id,
      adminNotes: body.adminNotes,
    },
    include: {
      user: true,
    },
  })

  await sendEmail(
    submission.user.email,
    'Requirements Submission Update',
    `
      <h1>Update on Your Submission</h1>
      <p>Hi ${submission.user.fullName || 'there'},</p>
      <p>Your submission for <strong>${submission.projectName}</strong> has been updated.</p>
      <p><strong>Status:</strong> ${body.status}</p>
      ${body.adminNotes ? `<p><strong>Notes:</strong> ${body.adminNotes}</p>` : ''}
    `
  )

  if (submission.user.phoneNumber && body.status === 'QUOTED') {
    await sendSMS(
      submission.user.phoneNumber,
      `CharaTech: Your quote for "${submission.projectName}" is ready! Check your email for details.`
    )
  }

  await prisma.notification.create({
    data: {
      userId: submission.userId,
      type: 'STATUS_UPDATE',
      channel: ['EMAIL', 'IN_APP'],
      subject: 'Submission Status Updated',
      message: `Your submission status has been updated to: ${body.status}`,
      metadata: { submissionId: submission.id, status: body.status },
      sentAt: new Date(),
    },
  })

  return submission
})
