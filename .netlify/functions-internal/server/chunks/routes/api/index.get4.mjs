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
  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });
  return submissions;
});

export { index_get as default };
//# sourceMappingURL=index.get4.mjs.map
