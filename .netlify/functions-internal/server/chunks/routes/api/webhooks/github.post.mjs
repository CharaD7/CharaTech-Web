import { d as defineEventHandler, M as readRawBody, N as getRequestHeader, c as createError, p as prisma } from '../../../_/nitro.mjs';
import { createHmac, timingSafeEqual } from 'node:crypto';
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
import 'consola';
import 'node:url';
import 'ipx';
import 'node:fs';
import 'node:path';

const github_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const body = await readRawBody(event);
  const signature = getRequestHeader(event, "x-hub-signature-256");
  if (secret && body) {
    if (!signature) {
      throw createError({ statusCode: 401, message: "Missing webhook signature" });
    }
    const expected = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw createError({ statusCode: 401, message: "Invalid webhook signature" });
    }
  }
  const githubEvent = getRequestHeader(event, "x-github-event");
  const payload = body ? JSON.parse(body) : {};
  const repoFullName = (_a = payload.repository) == null ? void 0 : _a.full_name;
  if (!repoFullName) return { received: true };
  const timeline = await prisma.projectTimeline.findFirst({
    where: { githubRepo: { equals: repoFullName, mode: "insensitive" } },
    include: { milestones: { orderBy: { order: "asc" } } }
  });
  if (!timeline) return { received: true, note: "No timeline linked to this repo" };
  switch (githubEvent) {
    case "push": {
      await prisma.projectTimeline.update({
        where: { id: timeline.id },
        data: { updatedAt: /* @__PURE__ */ new Date() }
      });
      break;
    }
    case "issues": {
      const action = payload.action;
      if (action === "closed" && ((_b = payload.issue) == null ? void 0 : _b.milestone)) {
        const milestoneNumber = payload.issue.milestone.number;
        const remainingOpen = payload.issue.milestone.open_issues;
        const dbMilestone = timeline.milestones.find((m) => m.githubMilestoneId === milestoneNumber);
        if (dbMilestone && remainingOpen === 0 && dbMilestone.status !== "COMPLETED") {
          await prisma.projectMilestone.update({
            where: { id: dbMilestone.id },
            data: { status: "COMPLETED", completedAt: /* @__PURE__ */ new Date() }
          });
        }
      }
      break;
    }
    case "milestone": {
      const action = payload.action;
      const milestoneNumber = (_c = payload.milestone) == null ? void 0 : _c.number;
      if (action === "closed" && milestoneNumber) {
        const dbMilestone = timeline.milestones.find((m) => m.githubMilestoneId === milestoneNumber);
        if (dbMilestone) {
          await prisma.projectMilestone.update({
            where: { id: dbMilestone.id },
            data: { status: "COMPLETED", completedAt: /* @__PURE__ */ new Date() }
          });
          const submission = await prisma.submission.findUnique({
            where: { id: timeline.submissionId },
            include: { user: true }
          });
          if (submission == null ? void 0 : submission.user) {
            await prisma.notification.create({
              data: {
                userId: submission.user.id,
                type: "STATUS_UPDATE",
                channel: ["IN_APP", "EMAIL"],
                subject: `Milestone Completed: ${payload.milestone.title}`,
                message: `Great news! The "${payload.milestone.title}" milestone on your ${submission.projectName} project has been completed on GitHub.`
              }
            });
          }
        }
      }
      break;
    }
    case "release": {
      const action = payload.action;
      if (action === "published" && !((_d = payload.release) == null ? void 0 : _d.draft) && !((_e = payload.release) == null ? void 0 : _e.prerelease)) {
        const releaseTitle = ((_f = payload.release) == null ? void 0 : _f.name) || ((_g = payload.release) == null ? void 0 : _g.tag_name);
        const exists = timeline.milestones.find((m) => {
          var _a2;
          return m.title.includes((_a2 = payload.release) == null ? void 0 : _a2.tag_name);
        });
        if (!exists && releaseTitle) {
          const maxOrder = Math.max(0, ...timeline.milestones.map((m) => m.order));
          await prisma.projectMilestone.create({
            data: {
              timelineId: timeline.id,
              title: `Release ${releaseTitle}`,
              description: (_j = (_i = (_h = payload.release) == null ? void 0 : _h.body) == null ? void 0 : _i.substring(0, 500)) != null ? _j : null,
              startDate: new Date(payload.release.published_at),
              endDate: new Date(payload.release.published_at),
              status: "COMPLETED",
              completedAt: new Date(payload.release.published_at),
              order: maxOrder + 1
            }
          });
        }
      }
      break;
    }
    case "pull_request": {
      if (payload.action === "closed" && ((_k = payload.pull_request) == null ? void 0 : _k.merged)) {
        await prisma.projectTimeline.update({
          where: { id: timeline.id },
          data: { updatedAt: /* @__PURE__ */ new Date() }
        });
      }
      break;
    }
  }
  return { received: true, event: githubEvent, repo: repoFullName };
});

export { github_post as default };
//# sourceMappingURL=github.post.mjs.map
