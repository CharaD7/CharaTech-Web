export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      projectName: body.projectName,
      industry: body.industry,
      projectType: body.projectTypes || [],
      complexity: body.complexity,
      budget: body.budget,
      timeline: body.timeline,
      requirements: body.requirements || {},
      additionalNotes: body.additionalNotes,
      dialogflowSessionId: body.dialogflowSessionId,
      aiConversation: body.aiConversation,
      status: 'PENDING',
    },
  })

  const config = useRuntimeConfig()
  
  await sendEmail(
    user.email,
    'Requirements Submission Received',
    `
      <h1>Thank you for your submission!</h1>
      <p>Hi ${user.fullName || 'there'},</p>
      <p>We have received your software requirements for <strong>${body.projectName}</strong>.</p>
      <p>Our team will review your submission and get back to you shortly.</p>
      <p>Submission ID: ${submission.id}</p>
    `
  )

  if (user.phoneNumber) {
    await sendSMS(
      user.phoneNumber,
      `CharaTech: Your requirements for "${body.projectName}" have been received. We'll review and contact you soon!`
    )
  }

  await sendEmail(
    config.public.adminEmail as string,
    'New Requirements Submission',
    `
      <h1>New Requirements Submission</h1>
      <p><strong>Project:</strong> ${body.projectName}</p>
      <p><strong>Client:</strong> ${user.fullName || user.email}</p>
      <p><strong>Industry:</strong> ${body.industry}</p>
      <p><strong>Complexity:</strong> ${body.complexity}</p>
      <p><a href="${config.public.appUrl}/admin/submissions/${submission.id}">View Submission</a></p>
    `
  )

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: 'SUBMISSION_RECEIVED',
      channel: ['EMAIL', 'SMS', 'IN_APP'],
      subject: 'Requirements Submission Received',
      message: `Your requirements for "${body.projectName}" have been received.`,
      sentAt: new Date(),
    },
  })

  return submission
})
