export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)

  const format = query.format as string || 'json'
  const submissionId = query.submissionId as string

  let submissions

  if (submissionId) {
    submissions = await prisma.submission.findMany({
      where: { id: submissionId },
      include: { user: true },
    })
  } else {
    submissions = await prisma.submission.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  if (format === 'csv') {
    const csvData = submissions.map(sub => ({
      'Submission ID': sub.id,
      'Project Name': sub.projectName,
      'Client Email': sub.user.email,
      'Client Name': sub.user.fullName || '',
      'Company': sub.user.companyName || '',
      'Industry': sub.industry,
      'Complexity': sub.complexity,
      'Status': sub.status,
      'Created At': sub.createdAt.toISOString(),
    }))

    const headers = Object.keys(csvData[0] || {})
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n')

    setHeader(event, 'Content-Type', 'text/csv')
    setHeader(event, 'Content-Disposition', 'attachment; filename="submissions.csv"')
    return csv
  }

  return submissions
})
