import { d as defineEventHandler, v as verifyToken, c as createError, b as readBody, p as prisma, e as sendEmail } from '../../../_/nitro.mjs';
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

const messages_post = defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event);
    if (user.role !== "ADMIN") {
      throw createError({
        statusCode: 403,
        message: "Access denied. Admin only."
      });
    }
    const { receiverId, submissionId, subject, content } = await readBody(event);
    if (!receiverId || !content) {
      throw createError({
        statusCode: 400,
        message: "Receiver ID and content are required"
      });
    }
    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        submissionId,
        subject,
        content
      }
    });
    const client = await prisma.user.findUnique({ where: { id: receiverId } });
    if (client) {
      await sendEmail(
        client.email,
        subject || "New message from CharaTech",
        `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2>${subject || "New message from CharaTech"}</h2>
            <p>Hi ${client.fullName || "there"},</p>
            <p>${content}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
            <p style="color:#888;font-size:12px">Log in to your CharaTech dashboard to reply.</p>
          </div>
        `
      );
    }
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "MESSAGE_RECEIVED",
        channel: ["EMAIL", "IN_APP"],
        subject: subject || "New message from CharaTech",
        message: content.length > 120 ? content.slice(0, 120) + "\u2026" : content,
        metadata: { messageId: message.id, submissionId: submissionId || null },
        sentAt: /* @__PURE__ */ new Date()
      }
    });
    return { success: true, message };
  } catch (error) {
    console.error("Error sending message:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to send message"
    });
  }
});

export { messages_post as default };
//# sourceMappingURL=messages.post.mjs.map
