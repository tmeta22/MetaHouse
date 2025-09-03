# Family Hub Deployment Guide

This guide covers different deployment options for the Family Hub application.

## Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Database migrations applied

## Environment Variables

- `DATABASE_URL`: SQLite database file path (default: `file:./family-hub.db`)
- `NODE_ENV`: Environment mode (`development` or `production`)

## Deployment Options

### 1. Vercel Deployment (Recommended for PWA)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL=file:/tmp/family-hub.db`

**Note**: Vercel uses serverless functions, so database persistence may be limited. Consider using a cloud database for production.

### 2. Docker Deployment

1. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

2. Or build manually:
   ```bash
   docker build -t family-hub .
   docker run -p 3000:3000 -v family_hub_data:/app/data family-hub
   ```

### 3. Traditional Server Deployment

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Build the application:
   ```bash
   pnpm build
   ```

3. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

4. Start the production server:
   ```bash
   pnpm start
   ```

### 4. PWA Installation

Once deployed, users can install the app as a PWA:

1. Open the app in a supported browser
2. Look for the "Install" or "Add to Home Screen" option
3. Follow the browser prompts to install

## Database Management

### Migrations
```bash
# Generate new migration
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Push schema changes (development)
pnpm db:push
```

### Seeding
```bash
# Seed database with initial data
pnpm db:seed
```

### Studio (Development)
```bash
# Open Drizzle Studio for database management
pnpm db:studio
```

## Production Considerations

1. **Database**: For production, consider using a more robust database solution
2. **Backups**: Implement regular database backups
3. **SSL**: Ensure HTTPS is enabled for PWA functionality
4. **Monitoring**: Set up application monitoring and logging
5. **Performance**: Enable caching and optimize static assets

## Troubleshooting

- **Database errors**: Check file permissions and disk space
- **PWA not installing**: Ensure HTTPS and valid manifest.json
- **API errors**: Check server logs and database connectivity