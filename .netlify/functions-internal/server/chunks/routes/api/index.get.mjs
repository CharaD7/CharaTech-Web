import { d as defineEventHandler, v as verifyToken, p as prisma, c as createError } from '../../_/nitro.mjs';
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

const index_get = defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event);
    const invoices = await prisma.invoice.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: "desc" }
    });
    const submissionIds = invoices.map((i) => i.submissionId).filter(Boolean);
    const submissions = submissionIds.length > 0 ? await prisma.submission.findMany({
      where: { id: { in: submissionIds } },
      select: { id: true, projectName: true, industry: true, complexity: true }
    }) : [];
    const subMap = Object.fromEntries(submissions.map((s) => [s.id, s]));
    const enriched = invoices.map((inv) => {
      var _a;
      return {
        ...inv,
        submission: (_a = subMap[inv.submissionId]) != null ? _a : null
      };
    });
    return { success: true, invoices: enriched };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch invoices"
    });
  }
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
