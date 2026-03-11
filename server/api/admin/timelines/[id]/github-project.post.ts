/** POST /api/admin/timelines/:id/github-project
 * Create a GitHub Projects v2 board + optional Milestone for a linked timeline.
 * Requires GITHUB_TOKEN with `project` + `repo` scopes.
 */
export default defineEventHandler(async (event) => {
  const user = await verifyToken(event)
  if (user.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  const id = getRouterParam(event, 'id')!
  const {
    projectTitle,
    description,
    visibility = 'PRIVATE',
    milestoneName,
    milestoneDueDate,
  } = await readBody(event)

  if (!projectTitle?.trim()) throw createError({ statusCode: 400, message: 'projectTitle is required' })

  const timeline = await prisma.projectTimeline.findUnique({
    where: { id },
    include: { milestones: true },
  })
  if (!timeline) throw createError({ statusCode: 404, message: 'Timeline not found' })
  if (!timeline.githubRepo) throw createError({ statusCode: 400, message: 'Link a GitHub repo to this timeline first' })

  // Get repo node_id (required for GraphQL project linking)
  const repoInfo = await getRepoInfo(timeline.githubRepo)

  // Get admin's GitHub user node_id
  const authUser = await getAuthenticatedUser()

  // 1. Create the Projects v2 board
  const project = await createGitHubProjectV2(authUser.node_id, projectTitle.trim())

  // 2. Update description + visibility
  if (description || visibility === 'PUBLIC') {
    try {
      await updateGitHubProject(project.id, {
        shortDescription: description?.slice(0, 256) || undefined,
        public: visibility === 'PUBLIC',
      })
    } catch {
      // Non-fatal — project is created, just description update failed
    }
  }

  // 3. Link the repo to the project
  await linkProjectToRepo(project.id, repoInfo.node_id)

  // 4. Optionally create a milestone
  let milestone: any = null
  if (milestoneName?.trim()) {
    milestone = await createGitHubMilestone(
      timeline.githubRepo,
      milestoneName.trim(),
      description || undefined,
      milestoneDueDate || undefined,
    )

    // Persist milestone to DB
    await prisma.projectMilestone.create({
      data: {
        timelineId: id,
        title: milestoneName.trim(),
        description: description || null,
        targetDate: milestoneDueDate ? new Date(milestoneDueDate) : null,
        githubMilestoneId: milestone.number,
        status: 'NOT_STARTED',
      },
    })
  }

  return {
    success: true,
    project,
    milestone,
    projectUrl: project.url,
  }
})
