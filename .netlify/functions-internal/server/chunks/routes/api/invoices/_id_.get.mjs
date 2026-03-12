import { d as defineEventHandler, v as verifyToken, f as getRouterParam, c as createError, p as prisma } from '../../../_/nitro.mjs';
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
  try {
    const user = await verifyToken(event);
    const id = getRouterParam(event, "id");
    if (!id) throw createError({ statusCode: 400, message: "Invoice ID required" });
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) throw createError({ statusCode: 404, message: "Invoice not found" });
    if (invoice.clientId !== user.id) {
      throw createError({ statusCode: 403, message: "Access denied" });
    }
    const submission = invoice.submissionId ? await prisma.submission.findUnique({
      where: { id: invoice.submissionId },
      select: { id: true, projectName: true, industry: true, complexity: true, projectType: true }
    }) : null;
    return { success: true, invoice: { ...invoice, submission } };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch invoice"
    });
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
