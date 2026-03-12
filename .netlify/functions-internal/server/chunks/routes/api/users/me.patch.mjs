import { d as defineEventHandler, L as requireAuth, b as readBody, p as prisma } from '../../../_/nitro.mjs';
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

const me_patch = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const body = await readBody(event);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: body.fullName,
      phoneNumber: body.phoneNumber,
      companyName: body.companyName
    }
  });
  return updated;
});

export { me_patch as default };
//# sourceMappingURL=me.patch.mjs.map
