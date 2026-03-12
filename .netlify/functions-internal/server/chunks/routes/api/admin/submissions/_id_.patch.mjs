import { d as defineEventHandler, r as requireAdmin, f as getRouterParam, b as readBody, p as prisma, e as sendEmail, i as sendSMS } from '../../../../_/nitro.mjs';
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
  const admin = await requireAdmin(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const submission = await prisma.submission.update({
    where: { id },
    data: {
      status: body.status,
      reviewedAt: /* @__PURE__ */ new Date(),
      reviewedBy: admin.id,
      adminNotes: body.adminNotes
    },
    include: {
      user: true
    }
  });
  await sendEmail(
    submission.user.email,
    "Requirements Submission Update",
    `
      <h1>Update on Your Submission</h1>
      <p>Hi ${submission.user.fullName || "there"},</p>
      <p>Your submission for <strong>${submission.projectName}</strong> has been updated.</p>
      <p><strong>Status:</strong> ${body.status}</p>
      ${body.adminNotes ? `<p><strong>Notes:</strong> ${body.adminNotes}</p>` : ""}
    `
  );
  if (submission.user.phoneNumber && body.status === "QUOTED") {
    await sendSMS(
      submission.user.phoneNumber,
      `CharaTech: Your quote for "${submission.projectName}" is ready! Check your email for details.`
    );
  }
  await prisma.notification.create({
    data: {
      userId: submission.userId,
      type: "STATUS_UPDATE",
      channel: ["EMAIL", "IN_APP"],
      subject: "Submission Status Updated",
      message: `Your submission status has been updated to: ${body.status}`,
      metadata: { submissionId: submission.id, status: body.status },
      sentAt: /* @__PURE__ */ new Date()
    }
  });
  return submission;
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
