import { d as defineEventHandler, v as verifyToken, b as readBody, c as createError, p as prisma, H as useRuntimeConfig, J as detectIntent, K as createDialogflowSession } from '../../_/nitro.mjs';
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
  var _a;
  const user = await verifyToken(event);
  const { content } = await readBody(event);
  if (!(content == null ? void 0 : content.trim())) throw createError({ statusCode: 400, message: "Message content required" });
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true }
  });
  if (!admin) throw createError({ statusCode: 500, message: "No admin configured" });
  const message = await prisma.message.create({
    data: {
      senderId: user.id,
      receiverId: admin.id,
      content: content.trim(),
      isBot: false
    }
  });
  const adminHasReplied = await prisma.message.findFirst({
    where: { senderId: admin.id, receiverId: user.id, isBot: false }
  });
  let botReply = null;
  if (!adminHasReplied) {
    let botContent = "Thanks for reaching out to CharaTech! \u{1F680} Our team will review your message shortly. In the meantime, feel free to browse your submissions or invoice status in the dashboard.";
    try {
      const config = useRuntimeConfig();
      const projectId = config.dialogflowProjectId;
      if (projectId) {
        const sessionId = `client-${user.id.slice(0, 8)}`;
        const result = await detectIntent(createDialogflowSession(), content.trim());
        if (result.success && ((_a = result.response) == null ? void 0 : _a.fulfillmentText)) {
          botContent = result.response.fulfillmentText;
        }
      }
    } catch {
    }
    botReply = await prisma.message.create({
      data: {
        senderId: admin.id,
        receiverId: user.id,
        content: botContent,
        isBot: true
      }
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: "STATUS_UPDATE",
        channel: ["IN_APP"],
        subject: "New message from client",
        message: `${user.email || "A client"} sent: ${content.trim().slice(0, 80)}${content.length > 80 ? "\u2026" : ""}`
      }
    });
  }
  return { message, botReply };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
