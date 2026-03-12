import { d as defineEventHandler, L as requireAuth, b as readBody, c as createError, p as prisma } from '../../../_/nitro.mjs';
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

const bulkArchive_patch = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const { ids } = body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw createError({
      statusCode: 400,
      message: "Invalid notification IDs"
    });
  }
  await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      userId: user.id
    },
    data: {
      archived: true,
      archivedAt: /* @__PURE__ */ new Date()
    }
  });
  return { success: true, archived: ids.length };
});

export { bulkArchive_patch as default };
//# sourceMappingURL=bulk-archive.patch.mjs.map
