import { d as defineEventHandler, v as verifyToken, c as createError, f as getRouterParam, p as prisma } from '../../../../_/nitro.mjs';
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

const _userId__get = defineEventHandler(async (event) => {
  const user = await verifyToken(event);
  if (user.role !== "ADMIN") throw createError({ statusCode: 403, message: "Admin only" });
  const clientId = getRouterParam(event, "userId");
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: clientId },
        { senderId: clientId, receiverId: user.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });
  await prisma.message.updateMany({
    where: { senderId: clientId, receiverId: user.id, read: false },
    data: { read: true, readAt: /* @__PURE__ */ new Date() }
  });
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true }
  });
  const adminHasReplied = messages.some((m) => m.senderId === user.id && !m.isBot);
  return { messages, client, adminId: user.id, isAiHandled: !adminHasReplied };
});

export { _userId__get as default };
//# sourceMappingURL=_userId_.get.mjs.map
