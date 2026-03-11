import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * POST /api/webhooks/github
 * Receives GitHub webhook events and auto-updates timeline/milestone state.
 *
 * GitHub repo webhook setup:
 *  - Payload URL: https://your-domain.com/api/webhooks/github
 *  - Content type: application/json
 *  - Secret: value of GITHUB_WEBHOOK_SECRET env var
 *  - Events: Push, Issues, Milestones, Pull requests, Releases
 */
export default defineEventHandler(async (event) => {
  const secret = process.env.GITHUB_WEBHOOK_SECRET
  const body = await readRawBody(event)
  const signature = getRequestHeader(event, 'x-hub-signature-256')

  // Verify HMAC-SHA256 signature if secret is configured
  if (secret && body) {
    if (!signature) {
      throw createError({ statusCode: 401, message: 'Missing webhook signature' })
    }
    const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expected)
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw createError({ statusCode: 401, message: 'Invalid webhook signature' })
    }
  }

  const githubEvent = getRequestHeader(event, 'x-github-event')
  const payload = body ? JSON.parse(body) : {}
  const repoFullName: string = payload.repository?.full_name

  if (!repoFullName) return { received: true }

  // Find timeline linked to this repo
  const timeline = await prisma.projectTimeline.findFirst({
    where: { githubRepo: { equals: repoFullName, mode: 'insensitive' } },
    include: { milestones: { orderBy: { order: 'asc' } } },
  })

  if (!timeline) return { received: true, note: 'No timeline linked to this repo' }

  switch (githubEvent) {
    case 'push': {
      // Just update the timeline timestamp — push shows activity
      await prisma.projectTimeline.update({
        where: { id: timeline.id },
        data: { updatedAt: new Date() },
      })
      break
    }

    case 'issues': {
      const action: string = payload.action
      // When any issue is closed, check if its milestone is now 100% closed
      if (action === 'closed' && payload.issue?.milestone) {
        const milestoneNumber: number = payload.issue.milestone.number
        const remainingOpen: number = payload.issue.milestone.open_issues

        const dbMilestone = timeline.milestones.find(m => m.githubMilestoneId === milestoneNumber)
        if (dbMilestone && remainingOpen === 0 && dbMilestone.status !== 'COMPLETED') {
          await prisma.projectMilestone.update({
            where: { id: dbMilestone.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          })
        }
      }
      break
    }

    case 'milestone': {
      const action: string = payload.action
      const milestoneNumber: number = payload.milestone?.number

      if (action === 'closed' && milestoneNumber) {
        const dbMilestone = timeline.milestones.find(m => m.githubMilestoneId === milestoneNumber)
        if (dbMilestone) {
          await prisma.projectMilestone.update({
            where: { id: dbMilestone.id },
            data: { status: 'COMPLETED', completedAt: new Date() },
          })

          // Notify client
          const submission = await prisma.submission.findUnique({
            where: { id: timeline.submissionId },
            include: { user: true },
          })
          if (submission?.user) {
            await prisma.notification.create({
              data: {
                userId: submission.user.id,
                type: 'STATUS_UPDATE',
                channel: ['IN_APP', 'EMAIL'],
                subject: `Milestone Completed: ${payload.milestone.title}`,
                message: `Great news! The "${payload.milestone.title}" milestone on your ${submission.projectName} project has been completed on GitHub.`,
              },
            })
          }
        }
      }
      break
    }

    case 'release': {
      const action: string = payload.action
      if (action === 'published' && !payload.release?.draft && !payload.release?.prerelease) {
        const releaseTitle = payload.release?.name || payload.release?.tag_name

        // Auto-create a milestone for this release if it doesn't exist
        const exists = timeline.milestones.find(m => m.title.includes(payload.release?.tag_name))
        if (!exists && releaseTitle) {
          const maxOrder = Math.max(0, ...timeline.milestones.map(m => m.order))
          await prisma.projectMilestone.create({
            data: {
              timelineId: timeline.id,
              title: `Release ${releaseTitle}`,
              description: payload.release?.body?.substring(0, 500) ?? null,
              startDate: new Date(payload.release.published_at),
              endDate: new Date(payload.release.published_at),
              status: 'COMPLETED',
              completedAt: new Date(payload.release.published_at),
              order: maxOrder + 1,
            },
          })
        }
      }
      break
    }

    case 'pull_request': {
      // Update timeline timestamp on PR merge
      if (payload.action === 'closed' && payload.pull_request?.merged) {
        await prisma.projectTimeline.update({
          where: { id: timeline.id },
          data: { updatedAt: new Date() },
        })
      }
      break
    }
  }

  return { received: true, event: githubEvent, repo: repoFullName }
})
