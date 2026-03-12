import { d as defineEventHandler, v as verifyToken, c as createError, p as prisma } from '../../../_/nitro.mjs';
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

const submissions_get = defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event);
    if (user.role !== "ADMIN") {
      throw createError({
        statusCode: 403,
        message: "Access denied. Admin only."
      });
    }
    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phoneNumber: true,
            companyName: true
          }
        },
        attachments: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return submissions;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch submissions"
    });
  }
});

export { submissions_get as default };
//# sourceMappingURL=submissions.get.mjs.map
