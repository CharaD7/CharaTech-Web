import { d as defineEventHandler, r as requireAdmin, a as getQuery, p as prisma, s as setHeader } from '../../../_/nitro.mjs';
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

const export_get = defineEventHandler(async (event) => {
  await requireAdmin(event);
  const query = getQuery(event);
  const format = query.format || "json";
  const submissionId = query.submissionId;
  let submissions;
  if (submissionId) {
    submissions = await prisma.submission.findMany({
      where: { id: submissionId },
      include: { user: true }
    });
  } else {
    submissions = await prisma.submission.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" }
    });
  }
  if (format === "csv") {
    const csvData = submissions.map((sub) => ({
      "Submission ID": sub.id,
      "Project Name": sub.projectName,
      "Client Email": sub.user.email,
      "Client Name": sub.user.fullName || "",
      "Company": sub.user.companyName || "",
      "Industry": sub.industry,
      "Complexity": sub.complexity,
      "Status": sub.status,
      "Created At": sub.createdAt.toISOString()
    }));
    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(","),
      ...csvData.map((row) => headers.map((h) => `"${row[h]}"`).join(","))
    ].join("\n");
    setHeader(event, "Content-Type", "text/csv");
    setHeader(event, "Content-Disposition", 'attachment; filename="submissions.csv"');
    return csv;
  }
  return submissions;
});

export { export_get as default };
//# sourceMappingURL=export.get.mjs.map
