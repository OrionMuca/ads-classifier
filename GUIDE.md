# Marketplace - Complete Guide

A comprehensive guide for the Marketplace application with all commands, explanations, and troubleshooting.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Database Commands](#database-commands)
3. [Elasticsearch Commands](#elasticsearch-commands)
4. [Kibana Setup](#kibana-setup)
5. [Troubleshooting](#troubleshooting)
6. [Development Commands](#development-commands)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+ (optional, for local development)

### 1. Start Docker Services
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
# Backend
cd apps/api
npm install

# Frontend
cd apps/web
npm install
```

### 3. Run Database Migration
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 4. Seed Database
```bash
cd apps/api
npm run seed
npm run sync:elasticsearch  # Always sync after seeding!
```

### 5. Start Development Servers

**Backend:**
```bash
cd apps/api
npm run start:dev
```

**Frontend:**
```bash
cd apps/web
npm run dev
```

### URLs
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5433
- Elasticsearch: http://localhost:9200
- Kibana: http://localhost:5601
- Redis: localhost:6379

---

## 📊 Database Commands

### Prisma Commands
```bash
cd apps/api

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (Database GUI)
npx prisma studio

# Push schema changes (without migration)
npx prisma db push

# Check migration status
npx prisma migrate status
```

### Database Access
**Connection Details:**
- Host: `localhost`
- Port: `5433`
- Database: `marketplace`
- User: `admin`
- Password: `password`

**Via Terminal:**
```bash
docker exec -it marketplace_postgres psql -U admin -d marketplace
```

**Via GUI (DataGrip/TablePlus/pgAdmin):**
```
Host: localhost
Port: 5433
Database: marketplace
User: admin
Password: password
```

### Seeding Commands
```bash
cd apps/api

# Seed everything (categories, locations, posts, ads)
npm run seed

# Seed only posts
npm run seed:posts

# Seed only ads
npm run seed:ads
```

### Check Database
```bash
cd apps/api

# Check if a post exists
npm run check:post <postId>

# Example
npm run check:post 96d9c944-8d5a-4071-9c24-54d5d058b53f
```

---

## 🔍 Elasticsearch Commands

### Check Elasticsearch Status
```bash
cd apps/api

# List all indexes
npm run list:indexes

# Check Elasticsearch status and data
npm run check:elasticsearch

# Check specific post in Elasticsearch
npm run check:elasticsearch <postId>
```

### Sync Elasticsearch with Database
```bash
cd apps/api

# Sync all posts from database to Elasticsearch
npm run sync:elasticsearch

# Reindex all posts (alternative)
npm run reindex

# Consolidate old indexes (migrate and delete)
npm run consolidate:indexes
```

**When to sync:**
- After seeding database
- After database reset
- When you see "post not found" errors
- After bulk imports

### Elasticsearch API (cURL)
```bash
# Check cluster health
curl http://localhost:9200/_cluster/health?pretty

# Get all posts
curl http://localhost:9200/marketplace_posts_v2/_search?pretty

# Get specific post
curl http://localhost:9200/marketplace_posts_v2/_doc/<postId>?pretty

# Count documents
curl http://localhost:9200/marketplace_posts_v2/_count?pretty

# Get index stats
curl http://localhost:9200/marketplace_posts_v2/_stats?pretty
```

### Indexes
You should have **2 indexes**:
- `marketplace_posts_v2` - All posts (active)
- `marketplace_search_history` - Search tracking

If you see old indexes like `marketplace_posts`, run:
```bash
npm run consolidate:indexes
```

---

## 📊 Kibana Setup

### Start Kibana
```bash
docker-compose up kibana
# Open: http://localhost:5601
```

### Quick Setup (5 Minutes)

1. **Create Index Pattern:**
   - Go to: **Stack Management → Index Patterns**
   - Pattern: `marketplace_posts_v2`
   - Time field: `createdAt`
   - Click: **Create**

2. **Create Visualization with Lens:**
   - Go to: **Analytics → Lens**
   - Select: `marketplace_posts_v2`
   - **Drag fields** to create charts:
     - Drag `status` → "Break down by" = Pie chart
     - Drag `price` → "Y-axis" = Bar chart
     - Drag `createdAt` → "X-axis" = Time series
   - Save visualization

3. **Create Dashboard:**
   - Go to: **Analytics → Dashboard**
   - Click: **Create dashboard**
   - Add your visualizations
   - Save dashboard

### Import Pre-built Dashboard
1. **Stack Management → Saved Objects**
2. Click: **Import**
3. Upload: `apps/api/kibana-dashboard-marketplace.json`
4. Click: **Import**

### Kibana Dev Tools Queries
```javascript
// Get all posts
GET marketplace_posts_v2/_search
{
  "query": { "match_all": {} },
  "size": 20
}

// Search posts by title
GET marketplace_posts_v2/_search
{
  "query": {
    "match": {
      "title": "iPhone"
    }
  }
}

// Get index stats
GET marketplace_posts_v2/_stats
```

---

## 🐛 Troubleshooting

### Post Not Found Error

**Problem:** Getting 404 when opening a post

**Solution:**
```bash
cd apps/api

# 1. Check if post exists in database
npm run check:post <postId>

# 2. Sync Elasticsearch with database
npm run sync:elasticsearch

# 3. Verify sync
npm run check:elasticsearch
```

**Root Cause:** Elasticsearch has old/stale data that doesn't match the database.

### Search Not Working After First Search

**Problem:** After searching once, subsequent searches don't work correctly.

**Solution:** Fixed in code - the search state now properly syncs with URL parameters.

### Elasticsearch Connection Refused

**Solution:**
```bash
# Check if Elasticsearch is running
docker ps | grep elasticsearch

# Start Elasticsearch
docker-compose up elasticsearch

# Check logs
docker logs marketplace_elasticsearch
```

### Database Connection Failed

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Start PostgreSQL
docker-compose up postgres

# Check logs
docker logs marketplace_postgres
```

### Port Conflicts

If port 5432 is in use, Docker uses port 5433 for PostgreSQL.

### Migration Failed

```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Run migrations
cd apps/api
npx prisma migrate dev
```

### Index Counts Don't Match

**Problem:** Elasticsearch has different number of documents than database.

**Solution:**
```bash
cd apps/api
npm run sync:elasticsearch
```

This clears old data and reindexes all posts from the database.

---

## 💻 Development Commands

### Backend (NestJS)
```bash
cd apps/api

# Development
npm run start:dev

# Production build
npm run build

# Production mode
npm run start:prod

# Lint
npm run lint

# Format code
npm run format
```

### Frontend (Next.js)
```bash
cd apps/web

# Development
npm run dev

# Production build
npm run build

# Production mode
npm run start
```

### Docker Commands
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker logs marketplace_postgres
docker logs marketplace_elasticsearch
docker logs marketplace_redis
docker logs marketplace_kibana

# Restart a service
docker-compose restart postgres
docker-compose restart elasticsearch

# Stop and remove volumes (reset everything)
docker-compose down -v
```

---

## 🔐 Admin Access

### Create Admin User

1. Register a user via the app
2. Access PostgreSQL:
```bash
docker exec -it marketplace_postgres psql -U admin -d marketplace
```
3. Update user role:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```
4. Access admin panel at http://localhost:3001/admin

### Default Admin Credentials
After seeding:
- Email: `admin@marketplace.com`
- Password: `admin123`

---

## 📁 Project Structure

```
ads-classifier/
├── apps/
│   ├── api/              # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/     # JWT authentication
│   │   │   ├── posts/    # Posts CRUD + Elasticsearch
│   │   │   ├── search/   # Search with filters
│   │   │   ├── admin/    # Admin panel API
│   │   │   ├── ads/      # Ads management
│   │   │   └── prisma/   # Database service
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/
│   │   └── scripts/      # Utility scripts
│   └── web/              # Next.js Frontend
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       └── lib/          # API client
├── docker-compose.yml
└── GUIDE.md
```

---

## 🔑 Environment Variables

### Backend (`apps/api/.env`)
```env
DATABASE_URL="postgresql://admin:password@localhost:5433/marketplace?schema=public"
JWT_SECRET="super-secret-key"
JWT_REFRESH_SECRET="super-secret-refresh-key"
ELASTICSEARCH_NODE="http://localhost:9200"
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 🛠️ Tech Stack

### Backend
- NestJS
- PostgreSQL (via Docker)
- Prisma ORM
- Elasticsearch
- Redis
- JWT Authentication

### Frontend
- Next.js 14 (App Router)
- TailwindCSS
- TanStack Query
- Headless UI

---

## 📝 All Available Commands

### Backend Scripts (`apps/api/package.json`)
```bash
npm run seed              # Seed everything
npm run seed:posts        # Seed only posts
npm run seed:ads          # Seed only ads
npm run check:post        # Check post in database
npm run check:elasticsearch # Check Elasticsearch status
npm run sync:elasticsearch # Sync ES with database
npm run reindex           # Reindex all posts
npm run list:indexes      # List all Elasticsearch indexes
npm run consolidate:indexes # Consolidate old indexes
```

### Database
```bash
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma Client
npx prisma studio         # Open Prisma Studio
npx prisma db push        # Push schema changes
```

---

## 🎯 Best Practices

1. **Always sync Elasticsearch after seeding:**
   ```bash
   npm run seed
   npm run sync:elasticsearch
   ```

2. **Check sync status:**
   ```bash
   npm run check:elasticsearch
   # Should match database count
   ```

3. **Use Kibana Lens** for dashboards (no templates needed!)

4. **Keep indexes consolidated** - run `consolidate:indexes` if you see old indexes

5. **Check logs** when troubleshooting:
   ```bash
   docker logs marketplace_postgres
   docker logs marketplace_elasticsearch
   ```

---

## 📚 Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **NestJS Docs:** https://docs.nestjs.com
- **Next.js Docs:** https://nextjs.org/docs
- **Elasticsearch Docs:** https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html
- **Kibana Docs:** https://www.elastic.co/guide/en/kibana/current/index.html

---

## 📄 License

MIT

