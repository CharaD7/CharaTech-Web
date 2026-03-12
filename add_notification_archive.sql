-- AlterTable
ALTER TABLE "Notification" 
ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Notification_archived_idx" ON "Notification"("archived");
