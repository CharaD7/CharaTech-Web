import { d as defineEventHandler, v as verifyToken, c as createError, b as readBody, p as prisma } from '../../../_/nitro.mjs';
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

const timelines_post = defineEventHandler(async (event) => {
  try {
    const user = await verifyToken(event);
    if (user.role !== "ADMIN") {
      throw createError({
        statusCode: 403,
        message: "Access denied. Admin only."
      });
    }
    const body = await readBody(event);
    const {
      submissionId,
      startDate,
      endDate,
      milestones
    } = body;
    if (!submissionId || !milestones || !Array.isArray(milestones)) {
      throw createError({
        statusCode: 400,
        message: "Submission ID and milestones array are required"
      });
    }
    const timeline = await prisma.projectTimeline.create({
      data: {
        submissionId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: "PLANNING",
        milestones: {
          create: milestones.map((m, index) => ({
            title: m.title,
            description: m.description,
            startDate: new Date(m.startDate),
            endDate: new Date(m.endDate),
            status: "PENDING",
            order: index
          }))
        }
      },
      include: {
        milestones: true
      }
    });
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    });
    if (submission) {
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          type: "STATUS_UPDATE",
          channel: ["EMAIL", "IN_APP"],
          subject: "Project Timeline Created",
          message: `A project timeline has been created for "${submission.projectName}" with ${milestones.length} milestones.`
        }
      });
    }
    return { success: true, timeline };
  } catch (error) {
    console.error("Error creating timeline:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to create timeline"
    });
  }
});

export { timelines_post as default };
//# sourceMappingURL=timelines.post.mjs.map
