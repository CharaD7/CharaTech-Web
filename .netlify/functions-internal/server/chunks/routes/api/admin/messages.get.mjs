import { d as defineEventHandler, v as verifyToken, c as createError, p as prisma } from '../../../_/nitro.mjs';
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

const messages_get = defineEventHandler(async (event) => {
  const user = await verifyToken(event);
  if (user.role !== "ADMIN") throw createError({ statusCode: 403, message: "Admin only" });
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ receiverId: user.id }, { senderId: user.id }]
    },
    orderBy: { createdAt: "desc" }
  });
  const conversationMap = /* @__PURE__ */ new Map();
  for (const msg of messages) {
    const clientId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(clientId)) {
      conversationMap.set(clientId, {
        clientId,
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount: 0,
        isAiHandled: true
      });
    }
    const conv = conversationMap.get(clientId);
    if (!msg.read && msg.receiverId === user.id) conv.unreadCount++;
    if (msg.senderId === user.id && !msg.isBot) conv.isAiHandled = false;
  }
  const clientIds = [...conversationMap.keys()];
  const clients = clientIds.length ? await prisma.user.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, email: true }
  }) : [];
  const result = [...conversationMap.values()].map((conv) => {
    var _a;
    const client = clients.find((c) => c.id === conv.clientId);
    return {
      ...conv,
      clientName: (client == null ? void 0 : client.name) || ((_a = client == null ? void 0 : client.email) == null ? void 0 : _a.split("@")[0]) || "Client",
      clientEmail: (client == null ? void 0 : client.email) || ""
    };
  });
  return result.sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
});

export { messages_get as default };
//# sourceMappingURL=messages.get.mjs.map
