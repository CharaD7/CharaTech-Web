import { d as defineEventHandler, b as readBody, c as createError, J as detectIntent, K as createDialogflowSession } from '../../../_/nitro.mjs';
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

const chat_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  const body = await readBody(event);
  const { message, sessionId } = body;
  if (!message) {
    throw createError({
      statusCode: 400,
      message: "Message is required"
    });
  }
  const result = await detectIntent(sessionId || createDialogflowSession(), message);
  if (!result.success) {
    throw createError({
      statusCode: 500,
      message: "Dialogflow error"
    });
  }
  return {
    response: ((_a = result.response) == null ? void 0 : _a.fulfillmentText) || "",
    intent: (_c = (_b = result.response) == null ? void 0 : _b.intent) == null ? void 0 : _c.displayName,
    parameters: (_d = result.response) == null ? void 0 : _d.parameters,
    sessionId
  };
});

export { chat_post as default };
//# sourceMappingURL=chat.post.mjs.map
