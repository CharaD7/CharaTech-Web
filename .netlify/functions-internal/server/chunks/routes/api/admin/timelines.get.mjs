import { d as defineEventHandler, r as requireAdmin, p as prisma } from '../../../_/nitro.mjs';
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

const timelines_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const timelines = await prisma.projectTimeline.findMany({
    include: {
      milestones: { orderBy: { order: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  const submissionIds = timelines.map((t) => t.submissionId);
  const submissions = await prisma.submission.findMany({
    where: { id: { in: submissionIds } },
    include: { user: { select: { fullName: true, email: true, companyName: true } } }
  });
  const subMap = Object.fromEntries(submissions.map((s) => [s.id, s]));
  return timelines.map((t) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    return {
      ...t,
      submission: (_a = subMap[t.submissionId]) != null ? _a : null,
      clientName: (_g = (_f = (_c = (_b = subMap[t.submissionId]) == null ? void 0 : _b.user) == null ? void 0 : _c.fullName) != null ? _f : (_e = (_d = subMap[t.submissionId]) == null ? void 0 : _d.user) == null ? void 0 : _e.email) != null ? _g : "Unknown",
      projectName: (_i = (_h = subMap[t.submissionId]) == null ? void 0 : _h.projectName) != null ? _i : "Untitled"
    };
  });
});

export { timelines_get as default };
//# sourceMappingURL=timelines.get.mjs.map
