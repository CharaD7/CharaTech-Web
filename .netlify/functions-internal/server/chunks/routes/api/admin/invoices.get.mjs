import { d as defineEventHandler, r as requireAdmin, p as prisma, c as createError } from '../../../_/nitro.mjs';
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

const invoices_get = defineEventHandler(async (event) => {
  try {
    await requireAdmin(event);
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
    const clientIds = [...new Set(invoices.map((i) => i.clientId))];
    const users = clientIds.length > 0 ? await prisma.user.findMany({
      where: { id: { in: clientIds } },
      select: { id: true, fullName: true, email: true, companyName: true }
    }) : [];
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    const enriched = invoices.map((inv) => {
      var _a;
      return {
        ...inv,
        client: (_a = userMap[inv.clientId]) != null ? _a : {
          fullName: "Unknown Client",
          email: "",
          companyName: ""
        }
      };
    });
    return { success: true, invoices: enriched };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch invoices"
    });
  }
});

export { invoices_get as default };
//# sourceMappingURL=invoices.get.mjs.map
