import { d as defineEventHandler, L as requireAuth, f as getRouterParam, p as prisma, c as createError } from '../../../../_/nitro.mjs';
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

const read_patch = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const notification = await prisma.notification.findUnique({
    where: { id }
  });
  if (!notification || notification.userId !== user.id) {
    throw createError({
      statusCode: 404,
      message: "Notification not found"
    });
  }
  const updated = await prisma.notification.update({
    where: { id },
    data: {
      read: true,
      readAt: /* @__PURE__ */ new Date()
    }
  });
  return updated;
});

export { read_patch as default };
//# sourceMappingURL=read.patch.mjs.map
