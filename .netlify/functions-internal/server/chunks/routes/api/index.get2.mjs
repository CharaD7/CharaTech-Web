import { d as defineEventHandler, v as verifyToken, p as prisma } from '../../_/nitro.mjs';
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
  const user = await verifyToken(event);
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true }
  });
  if (!admin) return { messages: [], adminId: null, isAiHandled: true };
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: user.id, receiverId: admin.id },
        { senderId: admin.id, receiverId: user.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });
  await prisma.message.updateMany({
    where: { receiverId: user.id, read: false },
    data: { read: true, readAt: /* @__PURE__ */ new Date() }
  });
  const isAiHandled = !messages.some((m) => m.senderId === admin.id && !m.isBot);
  return { messages, adminId: admin.id, adminName: admin.name || "CharaTech Support", isAiHandled };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
