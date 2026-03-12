import { d as defineEventHandler, v as verifyToken, c as createError, f as getRouterParam, b as readBody, p as prisma, k as getRepoInfo, m as getAuthenticatedUser, o as createGitHubProjectV2, q as updateGitHubProject, t as linkProjectToRepo, w as createGitHubMilestone } from '../../../../../_/nitro.mjs';
import '@supabase/supabase-js';
import '@prisma/client';
import '@prisma/adapter-pg';
import 'pg';
import '@google-cloud/dialogflow';
import 'uuid';
import 'nodemailer';
import 'twilio';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:url';
import 'ipx';
import 'node:fs';
import 'node:path';

const githubProject_post = defineEventHandler(async (event) => {
  const user = await verifyToken(event);
  if (user.role !== "ADMIN") throw createError({ statusCode: 403, message: "Admin only" });
  const id = getRouterParam(event, "id");
  const {
    projectTitle,
    description,
    visibility = "PRIVATE",
    milestoneName,
    milestoneDueDate
  } = await readBody(event);
  if (!(projectTitle == null ? void 0 : projectTitle.trim())) throw createError({ statusCode: 400, message: "projectTitle is required" });
  const timeline = await prisma.projectTimeline.findUnique({
    where: { id },
    include: { milestones: true }
  });
  if (!timeline) throw createError({ statusCode: 404, message: "Timeline not found" });
  if (!timeline.githubRepo) throw createError({ statusCode: 400, message: "Link a GitHub repo to this timeline first" });
  const repoInfo = await getRepoInfo(timeline.githubRepo);
  const authUser = await getAuthenticatedUser();
  const project = await createGitHubProjectV2(authUser.node_id, projectTitle.trim());
  if (description || visibility === "PUBLIC") {
    try {
      await updateGitHubProject(project.id, {
        shortDescription: (description == null ? void 0 : description.slice(0, 256)) || void 0,
        public: visibility === "PUBLIC"
      });
    } catch {
    }
  }
  await linkProjectToRepo(project.id, repoInfo.node_id);
  let milestone = null;
  if (milestoneName == null ? void 0 : milestoneName.trim()) {
    milestone = await createGitHubMilestone(
      timeline.githubRepo,
      milestoneName.trim(),
      description || void 0,
      milestoneDueDate || void 0
    );
    await prisma.projectMilestone.create({
      data: {
        timelineId: id,
        title: milestoneName.trim(),
        description: description || null,
        targetDate: milestoneDueDate ? new Date(milestoneDueDate) : null,
        githubMilestoneId: milestone.number,
        status: "NOT_STARTED"
      }
    });
  }
  return {
    success: true,
    project,
    milestone,
    projectUrl: project.url
  };
});

export { githubProject_post as default };
//# sourceMappingURL=github-project.post.mjs.map
