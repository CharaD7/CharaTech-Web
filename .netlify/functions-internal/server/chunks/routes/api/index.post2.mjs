import { d as defineEventHandler, L as requireAuth, b as readBody, p as prisma, H as useRuntimeConfig, e as sendEmail, i as sendSMS } from '../../_/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const submission = await prisma.submission.create({
    data: {
      userId: user.id,
      projectName: body.projectName,
      industry: body.industry,
      projectType: body.projectTypes || [],
      complexity: body.complexity,
      budget: body.budget,
      timeline: body.timeline,
      requirements: body.requirements || {},
      additionalNotes: body.additionalNotes,
      dialogflowSessionId: body.dialogflowSessionId,
      aiConversation: body.aiConversation,
      status: "PENDING"
    }
  });
  const config = useRuntimeConfig();
  await sendEmail(
    user.email,
    "Requirements Submission Received",
    `
      <h1>Thank you for your submission!</h1>
      <p>Hi ${user.fullName || "there"},</p>
      <p>We have received your software requirements for <strong>${body.projectName}</strong>.</p>
      <p>Our team will review your submission and get back to you shortly.</p>
      <p>Submission ID: ${submission.id}</p>
    `
  );
  if (user.phoneNumber) {
    await sendSMS(
      user.phoneNumber,
      `CharaTech: Your requirements for "${body.projectName}" have been received. We'll review and contact you soon!`
    );
  }
  await sendEmail(
    config.public.adminEmail,
    "New Requirements Submission",
    `
      <h1>New Requirements Submission</h1>
      <p><strong>Project:</strong> ${body.projectName}</p>
      <p><strong>Client:</strong> ${user.fullName || user.email}</p>
      <p><strong>Industry:</strong> ${body.industry}</p>
      <p><strong>Complexity:</strong> ${body.complexity}</p>
      <p><a href="${config.public.appUrl}/admin/submissions/${submission.id}">View Submission</a></p>
    `
  );
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SUBMISSION_RECEIVED",
      channel: ["EMAIL", "SMS", "IN_APP"],
      subject: "Requirements Submission Received",
      message: `Your requirements for "${body.projectName}" have been received. Our team will review and get back to you shortly.`,
      metadata: { submissionId: submission.id, projectName: body.projectName },
      sentAt: /* @__PURE__ */ new Date()
    }
  });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (admin) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "SUBMISSION_RECEIVED",
        channel: ["IN_APP"],
        subject: "New Requirements Submission",
        message: `${user.fullName || user.email} submitted requirements for "${body.projectName}".`,
        metadata: { submissionId: submission.id, projectName: body.projectName, clientEmail: user.email },
        sentAt: /* @__PURE__ */ new Date()
      }
    });
  }
  return submission;
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
