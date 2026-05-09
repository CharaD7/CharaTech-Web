-- Run this against your Supabase database (direct connection, not pgBouncer):
-- psql "$DIRECT_URL" -f prisma/migration-pending.sql

-- 1. Change PaymentProof.phase from enum to TEXT
ALTER TABLE "PaymentProof" ALTER COLUMN "phase" TYPE text;

-- 2. Drop the now-unused enum
DROP TYPE IF EXISTS "PaymentPhase";
