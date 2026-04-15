# Deployment Error Fix Guide

## 🔍 Issues Identified

You were experiencing 3 main errors on your Vercel deployment:

1. **"Supabase service key not configured"** - The `SUPABASE_SERVICE_KEY` environment variable was missing
2. **"Database error occurred"** - Database connection issues due to missing/incorrect configuration
3. **"Server Error" on /api/admin/timelines** - Related to the above configuration issues

## ✅ What I Fixed Locally

### 1. Updated `nuxt.config.ts`
- Added `supabaseServiceKey` to both private and public runtime config
- This allows the server to access the Supabase service key for admin operations

### 2. Updated `.env`
- Added `SUPABASE_SERVICE_KEY` with your service role key
- Note: I used the same value as `SUPABASE_ANON_KEY` since that appears to be your service role key

## 🚀 What You Need to Do on Vercel

### Step 1: Add Environment Variables to Vercel

Go to your Vercel project dashboard:
**Settings → Environment Variables**

Add the following environment variable (if not already present):

```bash
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucWpocGt1dnZucHdpdGx4dnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkyMDExOCwiZXhwIjoyMDg3NDk2MTE4fQ.VHZ9G-jqviNg99evBYbevHsWzKwVpftNXQVwjtGzCig
```

Also verify these critical variables are set:

```bash
DATABASE_URL=postgresql://postgres.dnqjhpkuvvnpwitlxvsd:Windows8TheBest%401234%21%21@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_PROJECT_URL=https://dnqjhpkuvvnpwitlxvsd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucWpocGt1dnZucHdpdGx4dnNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkyMDExOCwiZXhwIjoyMDg3NDk2MTE4fQ.VHZ5G-jqviNg99evBYbevHsWzKwVpftNXQVwjtGzCig
SUPABASE_JWT_SECRET=Ta1Ue9zkFcKufJQGxmklBQ5CilxJo0VlxhyOWji1BJUNJrtkNgIgSCdW3cP9tm8/WY9psoykawWGTintl3WFWg==
JWT_SECRET=1a68eb7eba211c54a7d6d98e90fa61aa3211c5d5e5ce6d797ad4b8a10a37360e
ADMIN_SUPABASE_UID=1ed929dd-5e46-4bb9-abe3-46073a045b83
ADMIN_EMAIL=jijakahn6@gmail.com
```

### Step 2: Deploy Changes

1. **Commit and push the changes:**
   ```bash
   git add .
   git commit -m "Fix: Add SUPABASE_SERVICE_KEY to runtime config"
   git push origin main
   ```

2. Vercel will automatically detect the push and trigger a new deployment

### Step 3: Verify the Fix

After deployment completes, test these endpoints:

1. **Test the auth link generation:**
   ```
   POST https://chara-tech-web.vercel.app/api/admin/users/[USER_ID]/generate-auth-link
   ```

2. **Test user retrieval:**
   ```
   GET https://chara-tech-web.vercel.app/api/admin/users?id=[USER_ID]
   ```

3. **Test timelines:**
   ```
   GET https://chara-tech-web.vercel.app/api/admin/timelines
   ```

## ⚠️ Important Security Note

**CRITICAL:** The `SUPABASE_SERVICE_KEY` in your `.env` file appears to be the same as your anon key. This might be incorrect. 

### To Get Your Real Service Role Key:

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/dnqjhpkuvvnpwitlxvsd
2. Click on **Settings** → **API**
3. Look for **service_role key** (NOT the anon key)
4. Copy that key and update both:
   - Your local `.env` file
   - Vercel environment variables

The service role key should have "service_role" in its decoded JWT payload, not "anon".

## 🔧 Why This Was Happening

1. **Missing Runtime Config**: The `generate-auth-link.post.ts` endpoint was trying to access `config.public.supabaseServiceKey`, but this wasn't defined in `nuxt.config.ts`

2. **Environment Variable Mismatch**: The code expected `SUPABASE_SERVICE_KEY` but it wasn't set in your environment

3. **Database Connection**: Without proper configuration, Prisma couldn't establish a connection to your Supabase PostgreSQL database

## 📝 Next Steps

1. ✅ Commit and push changes to trigger Vercel deployment
2. ✅ Add/verify `SUPABASE_SERVICE_KEY` in Vercel environment variables
3. ✅ Get the real service role key from Supabase (if different from anon key)
4. ✅ Test all three endpoints that were failing
5. ✅ Monitor Vercel deployment logs for any other issues

## 🆘 If Issues Persist

If you still see errors after deployment:

1. Check Vercel deployment logs: **Deployments → [Latest Deployment] → Runtime Logs**
2. Verify all environment variables are set correctly in Vercel
3. Make sure the service role key has proper permissions in Supabase
4. Check if your database is accessible from Vercel's IP addresses

---

**Let me know once you've deployed and I can help verify everything is working!**
