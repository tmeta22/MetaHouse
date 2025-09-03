# Family Hub

A comprehensive family management hub for organizing schedules, tracking subscriptions, managing family activities, and planning trips and parties.

## Features

- **Family Schedule Management**: Organize and track family events and activities
- **Subscription Tracking**: Monitor and manage family subscriptions
- **Transaction Tracking**: Keep track of family expenses
- **Trip Planning**: Plan and organize family trips with budget tracking
- **Party Planning**: Organize family celebrations and events
- **Calendar Integration**: Sync events with family calendars
- **Light/Glassmorphism Theme**: Customizable appearance
- **PWA Support**: Install as a mobile app

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Database**: SQLite (local) / PostgreSQL (production)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Quick Deploy to Vercel (Recommended)

**⚠️ Important: Database Configuration for Production**

SQLite doesn't work on Vercel's serverless environment. You must use PostgreSQL/Neon for production deployments.

#### Option 1: Deploy with Git Integration (Easiest)

1. **Set up Production Database:**
   - Create a free account at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
   - Create a new PostgreSQL database
   - Copy the connection string (DATABASE_URL)

2. **Push to GitHub** (if not already done):
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/yourusername/family-hub.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign up/login with your GitHub account
   - Click "New Project"
   - Select your `family-hub` repository
   - Vercel will auto-detect it's a Next.js project

4. **Configure Environment Variables (REQUIRED)** (in Vercel dashboard):
   ```bash
   # For production with Neon/PostgreSQL (required):
   DATABASE_URL=postgresql://username:password@host/database
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   ```

5. **Deploy**:
   - Click "Deploy"
   - Your app will be live at `https://your-app-name.vercel.app`
   - Future pushes to main branch will auto-deploy

### Troubleshooting 404 Errors

If you encounter a 404 NOT_FOUND error:

1. **Check Environment Variables:**
   - Ensure `DATABASE_URL` is set correctly in Vercel dashboard
   - Verify the PostgreSQL connection string format

2. **Redeploy:**
   - Go to Vercel dashboard → Deployments
   - Click "Redeploy" on the latest deployment

3. **Check Build Logs:**
   - Review the build logs for any database connection errors
   - Ensure all dependencies are properly installed

#### Option 2: Deploy without Git (Direct Upload)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy from terminal**:
   ```bash
   vercel
   # Follow the prompts
   # Set environment variables when prompted
   ```

### Database Setup for Production

#### Option A: Neon (PostgreSQL) - Recommended
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel environment variables

#### Option B: SQLite (Simpler)
- No additional setup needed
- Leave `DATABASE_URL` empty in environment variables
- Data will reset on each deployment (good for testing)

### Post-Deployment Steps

1. **Test your deployment**:
   - Visit your Vercel URL
   - Check all features work correctly
   - Test notifications and navigation

2. **Set up custom domain** (optional):
   - In Vercel dashboard, go to your project
   - Click "Domains" tab
   - Add your custom domain

3. **Monitor and maintain**:
   - Check Vercel dashboard for deployment logs
   - Monitor performance and usage
   - Update environment variables as needed

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:push` - Push schema changes to database

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── planning/          # Trip and party planning pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── lib/                   # Utilities and configurations
│   ├── db/               # Database schema and utilities
│   └── ...               # Other utilities
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary.