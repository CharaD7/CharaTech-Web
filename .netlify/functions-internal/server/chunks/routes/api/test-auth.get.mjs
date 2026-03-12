import { d as defineEventHandler, I as getHeader, v as verifyToken, p as prisma } from '../../_/nitro.mjs';
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

const testAuth_get = defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");
  console.log("Auth header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: "No authorization header"
    };
  }
  const token = authHeader.split("Bearer ")[1];
  console.log("Token (first 50 chars):", token.substring(0, 50) + "...");
  try {
    const decodedToken = await verifyToken(event);
    console.log("Decoded token:", decodedToken);
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid }
    });
    console.log("User found:", user);
    return {
      success: true,
      decodedToken,
      user
    };
  } catch (error) {
    console.error("Test error:", error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
});

export { testAuth_get as default };
//# sourceMappingURL=test-auth.get.mjs.map
