import { d as defineEventHandler, L as requireAuth, p as prisma } from '../../_/nitro.mjs';
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
  const user = await requireAuth(event);
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      archived: false
      // Don't show archived notifications
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  return notifications.filter((n) => n.createdAt).map((n) => {
    var _a, _b;
    return {
      ...n,
      createdAt: n.createdAt.toISOString(),
      readAt: ((_a = n.readAt) == null ? void 0 : _a.toISOString()) || null,
      archivedAt: ((_b = n.archivedAt) == null ? void 0 : _b.toISOString()) || null
    };
  });
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map
