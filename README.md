# CharaTech Requirements Platform

A modern, AI-powered platform for gathering software project requirements built with NuxtJS, PostgreSQL, Firebase Authentication, and Dialogflow.

## 🚀 Features

### For Clients
- **Industry-Specific Forms**: Tailored requirement forms based on your industry (Healthcare, Finance, E-commerce, Education, etc.)
- **AI Assistant**: Dialogflow-powered chatbot to help clarify requirements
- **Modern UI**: Sleek animations and intuitive interface using @vueuse/motion
- **Real-time Notifications**: Email and SMS alerts for submission updates
- **Project Tracking**: View and manage all your submissions

### For Admins
- **Comprehensive Dashboard**: View all submissions with advanced filtering
- **Analytics**: Real-time statistics and insights
- **Status Management**: Update submission statuses and add notes
- **Export Functionality**: Export submissions to CSV
- **Search & Filter**: Find submissions by industry, status, or keyword

## 🛠️ Tech Stack

- **Frontend**: NuxtJS 4, Vue 3, TypeScript
- **UI Framework**: Nuxt UI, Tailwind CSS
- **Animations**: @vueuse/motion, @formkit/auto-animate
- **Authentication**: Firebase Auth
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Google Dialogflow
- **Notifications**: 
  - Email: Nodemailer (SMTP)
  - SMS: Twilio
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Firebase project
- Google Cloud project (for Dialogflow)
- Twilio account (for SMS)
- SMTP server (for emails)

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Configuration

The project uses different environment configurations for development and production.

#### Development Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in your local development credentials. The `.env` file is already configured for local development with:
- Local PostgreSQL database
- Firebase credentials
- `http://localhost:3000` as the app URL

#### Production Setup

For production deployment on Netlify:

1. **Database**: Set up a cloud PostgreSQL database (Railway, Supabase, Neon, or Render)
2. **Netlify Environment Variables**: 
   - Go to your Netlify site dashboard
   - Navigate to **Site settings** → **Environment variables**
   - Add all variables from `.env.production`
   - Update `DATABASE_URL` with your production database URL
   - Update `NUXT_PUBLIC_APP_URL` with your Netlify URL
   - Generate a secure `JWT_SECRET`:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

See `tmp/ENVIRONMENT_SETUP.md` for detailed environment configuration guide.

### 3. Database Setup

#### Development
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed the database
pnpm db:seed
```

#### Production
```bash
# Run production migrations
pnpm db:migrate:prod
```

### 4. Development

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### 5. Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check environment configuration:

```bash
pnpm env:check
```

## 📁 Key Files

- `app/config/requirements.ts` - Industry-specific requirements configuration
- `server/api/` - API endpoints
- `prisma/schema.prisma` - Database schema
- `.env` - Active environment variables (local development)
- `.env.development` - Development environment template
- `.env.production` - Production environment template
- `.env.example` - Environment variables template
- `netlify.toml` - Netlify deployment configuration
- `tmp/ENVIRONMENT_SETUP.md` - Detailed environment setup guide

## 🎯 First Steps

1. Set up your `.env` file with all required credentials
2. Create Firebase project and get credentials
3. Set up PostgreSQL database
4. Configure Dialogflow for AI features
5. Run database migrations
6. Start development server
7. Register the admin account:
   - User with email `jijakahn6@gmail.com` will automatically become admin upon registration
   - After registration, the endpoint `/api/admin/update-admin-user` can be called to manually set admin role

## 🔑 Admin Access

The admin user (`jijakahn6@gmail.com`) has access to:
- `/admin` - Admin dashboard
- Full submission management
- User analytics
- Status updates and notes
- CSV export functionality

## 📝 License

MIT

---

Built with ❤️ using NuxtJS
