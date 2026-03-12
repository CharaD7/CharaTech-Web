import { d as defineEventHandler, L as requireAuth, f as getRouterParam, p as prisma, c as createError } from '../../../_/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = getRouterParam(event, "id");
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          companyName: true
        }
      }
    }
  });
  if (!submission) {
    throw createError({
      statusCode: 404,
      message: "Submission not found"
    });
  }
  if (submission.userId !== user.id && user.role !== "ADMIN") {
    throw createError({
      statusCode: 403,
      message: "Access denied"
    });
  }
  return submission;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
