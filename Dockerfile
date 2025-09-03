# Use the official Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/family-hub.db

# Build the application
RUN pnpm build

# Run database migrations
RUN pnpm db:migrate

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]