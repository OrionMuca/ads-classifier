# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production && npm cache clean --force

# Install Prisma CLI for migrations (needed for migrate deploy)
RUN npm install prisma --save-dev=false --save-prod=false

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Create entrypoint script to run migrations before starting
RUN echo '#!/bin/sh\n\
set -e\n\
echo "🔍 Checking database connection..."\n\
for i in 1 2 3 4 5; do\n\
  if npx prisma migrate status > /dev/null 2>&1; then\n\
    break\n\
  fi\n\
  echo "⏳ Waiting for database... ($i/5)"\n\
  sleep 2\n\
done\n\
echo "✅ Database connected. Running migrations..."\n\
npx prisma migrate deploy\n\
echo "🚀 Migrations completed. Starting application..."\n\
exec node dist/src/main\n\
' > /app/docker-entrypoint.sh && chmod +x /app/docker-entrypoint.sh

# Start the application
CMD ["/app/docker-entrypoint.sh"]
