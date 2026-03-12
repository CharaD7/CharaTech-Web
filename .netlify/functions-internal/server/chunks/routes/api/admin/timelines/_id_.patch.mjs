import { d as defineEventHandler, r as requireAdmin, f as getRouterParam, c as createError, b as readBody, p as prisma } from '../../../../_/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const timelineId = getRouterParam(event, "id");
  if (!timelineId) throw createError({ statusCode: 400, message: "Missing timeline ID" });
  const body = await readBody(event);
  const { githubRepo, githubRepoId, status, startDate, endDate, milestones } = body;
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (githubRepo !== void 0) updateData.githubRepo = githubRepo || null;
  if (githubRepoId !== void 0) updateData.githubRepoId = githubRepoId ? Number(githubRepoId) : null;
  if (status) updateData.status = status;
  if (startDate !== void 0) updateData.startDate = startDate ? new Date(startDate) : null;
  if (endDate !== void 0) updateData.endDate = endDate ? new Date(endDate) : null;
  const timeline = await prisma.projectTimeline.update({
    where: { id: timelineId },
    data: updateData,
    include: { milestones: { orderBy: { order: "asc" } } }
  });
  if (milestones && Array.isArray(milestones)) {
    await Promise.all(
      milestones.map((m) => {
        const mData = {};
        if (m.status) mData.status = m.status;
        if (m.githubMilestoneId !== void 0) mData.githubMilestoneId = m.githubMilestoneId ? Number(m.githubMilestoneId) : null;
        if (m.status === "COMPLETED") mData.completedAt = /* @__PURE__ */ new Date();
        if (!Object.keys(mData).length) return Promise.resolve();
        return prisma.projectMilestone.update({ where: { id: m.id }, data: mData });
      })
    );
  }
  return { success: true, timeline };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
