export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)

    const body = await readBody(event)
    const { submissionId, currency } = body

    if (!submissionId) {
      throw createError({ statusCode: 400, message: 'submissionId is required' })
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: { select: { id: true, fullName: true, email: true, companyName: true } } },
    })

    if (!submission) {
      throw createError({ statusCode: 404, message: 'Submission not found' })
    }

    // Use the submission's currency if available, otherwise use the provided currency or default to USD
    const invoiceCurrency = submission.currency || currency || 'USD'

    const pricing = generatePricing({
      projectName: submission.projectName,
      projectType: submission.projectType as string[],
      complexity: submission.complexity as string,
      industry: submission.industry as string,
      requirements: (submission.requirements as Record<string, any>) ?? {},
      budget: submission.budget as string | null,
      currency: invoiceCurrency,
    })

    return {
      success: true,
      submission: {
        id: submission.id,
        projectName: submission.projectName,
        industry: submission.industry,
        complexity: submission.complexity,
        budget: submission.budget,
        timeline: submission.timeline,
        currency: invoiceCurrency,
        country: submission.country,
        clientId: submission.userId,
        client: submission.user,
      },
      pricing,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate invoice estimate',
    })
  }
})
