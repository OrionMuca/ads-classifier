# Marketplace - Facebook Marketplace Clone

A modern, full-stack marketplace application built with Next.js 14 and NestJS.

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
npx prisma db push
npx prisma generate
```

### 4. Start Development Servers

**Backend**:
```bash
cd apps/api
npm run start:dev
```

**Frontend**:
```bash
cd apps/web
npm run dev
```

## 📊 Database Access

### Docker PostgreSQL (Port 5433)

**Connection Details**:
- **Host**: `localhost`
- **Port**: `5433`
- **Database**: `marketplace`
- **User**: `admin`
- **Password**: `password`

**Access via Terminal**:
```bash
docker exec -it marketplace_postgres psql -U admin -d marketplace
```

**DataGrip / TablePlus / pgAdmin**:
```
Host:     localhost
Port:     5433
Database: marketplace
User:     admin
Password: password
```

### Local PostgreSQL (Port 5432)
Your local PostgreSQL installation remains on port 5432 for other projects.

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
│   │   │   └── prisma/   # Database service
│   │   └── prisma/
│   │       └── schema.prisma
│   └── web/              # Next.js Frontend
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       └── lib/          # API client
├── docker-compose.yml
└── README.md
```

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

## 🌐 URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Docker PostgreSQL | localhost:5433 |
| Elasticsearch | http://localhost:9200 |
| Redis | localhost:6379 |

## 📝 Common Commands

### Docker
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker logs marketplace_postgres
docker logs marketplace_elasticsearch
docker logs marketplace_redis

# Restart a service
docker-compose restart postgres
```

### Database
```bash
# Run migration
cd apps/api
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio

# Access database terminal
docker exec -it marketplace_postgres psql -U admin -d marketplace
```

### Backend
```bash
cd apps/api
npm run start:dev    # Development
npm run build        # Production build
npm run start:prod   # Production mode
```

### Frontend
```bash
cd apps/web
npm run dev          # Development
npm run build        # Production build
npm run start        # Production mode
```

## 🔐 Admin Access

To create an admin user:

1. Register a user via the app
2. Access PostgreSQL:
```bash
docker exec -it marketplace_postgres psql -U admin -d marketplace
```
3. Update user role:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```
4. Access admin panel at `/admin`

## 📚 Documentation

- [Quick Start Guide](./QUICK_START.md)
- [PostgreSQL Setup](./POSTGRESQL_SETUP.md)
- [Walkthrough](./walkthrough.md)

## 🐛 Troubleshooting

### Port Conflicts
If port 5432 is already in use by local PostgreSQL, the Docker container uses port 5433 instead.

### Database Migration Failed
```bash
docker-compose down -v
docker-compose up -d
cd apps/api
npx prisma db push
```

### Can't Connect to Database
Check if Docker is running:
```bash
docker ps | grep marketplace_postgres
```

## 📄 License

MIT
