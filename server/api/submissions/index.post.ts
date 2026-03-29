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
      aiConversation: body.aiConversation,
      status: 'PENDING',
      currency: body.currency || 'USD',
      country: body.country,
    },
  })

  // Handle media attachments (images, videos, links)
  if (body.media && Array.isArray(body.media) && body.media.length > 0) {
    for (const media of body.media) {
      await prisma.attachment.create({
        data: {
          submissionId: submission.id,
          type: media.type || 'LINK',
          fileName: media.name || null,
          fileUrl: media.url,
          fileType: media.type || null,
          thumbnail: media.thumbnail || null,
          description: media.description || null,
        },
      })
    }
  }

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
      <p><strong>Country:</strong> ${body.country || 'Not specified'}</p>
      <p><strong>Currency:</strong> ${body.currency || 'USD'}</p>
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
      message: `Your requirements for "${body.projectName}" have been received. Our team will review and get back to you shortly.`,
      metadata: { submissionId: submission.id, projectName: body.projectName },
      sentAt: new Date(),
    },
  })

  // Notify admin in-app
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (admin) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'SUBMISSION_RECEIVED',
        channel: ['IN_APP'],
        subject: 'New Requirements Submission',
        message: `${user.fullName || user.email} submitted requirements for "${body.projectName}".`,
        metadata: { 
          submissionId: submission.id, 
          projectName: body.projectName, 
          clientEmail: user.email,
          currency: body.currency,
          country: body.country 
        },
        sentAt: new Date(),
      },
    })
  }

  return submission
})
