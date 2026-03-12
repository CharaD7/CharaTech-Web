import { d as defineEventHandler, I as getHeader, H as useRuntimeConfig } from '../../_/nitro.mjs';
import { decodeJwt, jwtVerify } from 'jose';
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

const debugToken_get = defineEventHandler(async (event) => {
  var _a;
  const authHeader = getHeader(event, "authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: "No token provided",
      hasAuth: false
    };
  }
  const token = authHeader.split("Bearer ")[1];
  const config = useRuntimeConfig();
  const decoded = decodeJwt(token);
  const response = {
    tokenStart: token.substring(0, 30) + "...",
    decodedPayload: decoded,
    jwtSecretConfigured: !!config.supabaseJwtSecret,
    jwtSecretLength: ((_a = config.supabaseJwtSecret) == null ? void 0 : _a.length) || 0
  };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.supabaseJwtSecret)
    );
    response.verified = true;
    response.verifiedPayload = payload;
  } catch (error) {
    response.verified = false;
    response.verificationError = {
      message: error.message,
      code: error.code,
      name: error.name
    };
  }
  return response;
});

export { debugToken_get as default };
//# sourceMappingURL=debug-token.get.mjs.map
