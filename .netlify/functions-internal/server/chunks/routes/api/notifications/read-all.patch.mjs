import { d as defineEventHandler, L as requireAuth, p as prisma } from '../../../_/nitro.mjs';
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

const readAll_patch = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true, readAt: /* @__PURE__ */ new Date() }
  });
  return { success: true };
});

export { readAll_patch as default };
//# sourceMappingURL=read-all.patch.mjs.map
