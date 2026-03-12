import { d as defineEventHandler, p as prisma, c as createError } from '../../../_/nitro.mjs';
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

const updateAdminUser_post = defineEventHandler(async (event) => {
  try {
    const adminEmail = "jijakahn6@gmail.com";
    const user = await prisma.user.update({
      where: {
        email: adminEmail
      },
      data: {
        role: "ADMIN"
      }
    });
    return {
      success: true,
      message: "User updated to admin",
      user: {
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error("Error updating admin user:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to update user to admin"
    });
  }
});

export { updateAdminUser_post as default };
//# sourceMappingURL=update-admin-user.post.mjs.map
