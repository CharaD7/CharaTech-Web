-- Rename projectType column to projectTypes to match Prisma schema
ALTER TABLE "Submission" RENAME COLUMN "projectType" TO "projectTypes";
