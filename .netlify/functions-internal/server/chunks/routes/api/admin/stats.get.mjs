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

const stats_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const submissions = await prisma.submission.findMany({
    select: {
      industry: true,
      complexity: true,
      status: true,
      createdAt: true
    }
  });
  const byIndustry = submissions.reduce((acc, sub) => {
    acc[sub.industry] = (acc[sub.industry] || 0) + 1;
    return acc;
  }, {});
  const byComplexity = submissions.reduce((acc, sub) => {
    acc[sub.complexity] = (acc[sub.complexity] || 0) + 1;
    return acc;
  }, {});
  const byStatus = submissions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {});
  const totalUsers = await prisma.user.count();
  const totalSubmissions = submissions.length;
  const pendingSubmissions = await prisma.submission.count({
    where: { status: "PENDING" }
  });
  return {
    totalUsers,
    totalSubmissions,
    pendingSubmissions,
    byIndustry,
    byComplexity,
    byStatus
  };
});

export { stats_get as default };
//# sourceMappingURL=stats.get.mjs.map
