-- Add supabaseUid column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "supabaseUid" TEXT;

-- Create unique index on supabaseUid
CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseUid_key" ON "User"("supabaseUid");

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "User_supabaseUid_idx" ON "User"("supabaseUid");

-- Make firebaseUid nullable if not already
ALTER TABLE "User" ALTER COLUMN "firebaseUid" DROP NOT NULL;
