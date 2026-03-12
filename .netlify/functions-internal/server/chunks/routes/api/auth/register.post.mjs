import { d as defineEventHandler, b as readBody, c as createError, H as useRuntimeConfig, p as prisma } from '../../../_/nitro.mjs';
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

const register_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { supabaseUid, email, fullName, phoneNumber, companyName } = body;
  if (!supabaseUid || !email) {
    throw createError({
      statusCode: 400,
      message: "Supabase UID and email are required"
    });
  }
  const config = useRuntimeConfig();
  const isAdmin = supabaseUid === config.adminSupabaseUid;
  const user = await prisma.user.upsert({
    where: { supabaseUid },
    create: {
      supabaseUid,
      email,
      fullName,
      phoneNumber,
      companyName,
      role: isAdmin ? "ADMIN" : "CLIENT"
    },
    update: {
      email
    }
  });
  if (user.role === "CLIENT") {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "WELCOME",
        channel: ["IN_APP"],
        // Removed 'EMAIL' channel
        subject: "Welcome to CharaTech!",
        message: "Thank you for registering with CharaTech Requirements Platform.",
        sentAt: /* @__PURE__ */ new Date()
      }
    });
  }
  return user;
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
