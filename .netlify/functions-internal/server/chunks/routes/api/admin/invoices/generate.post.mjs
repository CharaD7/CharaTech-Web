import { d as defineEventHandler, r as requireAdmin, b as readBody, c as createError, p as prisma, h as generatePricing } from '../../../../_/nitro.mjs';
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

const generate_post = defineEventHandler(async (event) => {
  var _a;
  try {
    await requireAdmin(event);
    const body = await readBody(event);
    const { submissionId, currency } = body;
    if (!submissionId) {
      throw createError({ statusCode: 400, message: "submissionId is required" });
    }
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: { select: { id: true, fullName: true, email: true, companyName: true } } }
    });
    if (!submission) {
      throw createError({ statusCode: 404, message: "Submission not found" });
    }
    const pricing = generatePricing({
      projectName: submission.projectName,
      projectType: submission.projectType,
      complexity: submission.complexity,
      industry: submission.industry,
      requirements: (_a = submission.requirements) != null ? _a : {},
      budget: submission.budget,
      currency: currency || "USD"
    });
    return {
      success: true,
      submission: {
        id: submission.id,
        projectName: submission.projectName,
        industry: submission.industry,
        complexity: submission.complexity,
        budget: submission.budget,
        timeline: submission.timeline,
        clientId: submission.userId,
        client: submission.user
      },
      pricing
    };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to generate invoice estimate"
    });
  }
});

export { generate_post as default };
//# sourceMappingURL=generate.post.mjs.map
