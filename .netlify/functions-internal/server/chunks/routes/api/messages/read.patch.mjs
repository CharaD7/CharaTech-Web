import { d as defineEventHandler, v as verifyToken, p as prisma } from '../../../_/nitro.mjs';
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
  const user = await verifyToken(event);
  const result = await prisma.message.updateMany({
    where: { receiverId: user.id, read: false },
    data: { read: true, readAt: /* @__PURE__ */ new Date() }
  });
  return { success: true, updated: result.count };
});

export { read_patch as default };
//# sourceMappingURL=read.patch.mjs.map
