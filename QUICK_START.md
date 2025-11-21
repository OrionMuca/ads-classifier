# Marketplace - Quick Start Guide

## 🚀 Running the Application

### 1. Start Docker Services (Required)

```bash
# From project root
docker-compose up -d

# Verify services are running
docker ps
```

You should see 3 containers:
- `marketplace_postgres`
- `marketplace_elasticsearch`
- `marketplace_redis`

### 2. Setup Backend (NestJS)

```bash
cd apps/api

# Install dependencies (if not done)
npm install

# Push database schema
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Start development server
npm run start:dev
```

Backend will run at **http://localhost:3000**

### 3. Setup Frontend (Next.js)

```bash
# In a new terminal
cd apps/web

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Frontend will run at **http://localhost:3001**

---

## 📊 Database Access

### PostgreSQL Terminal

```bash
# Access database
docker exec -it marketplace_postgres psql -U admin -d marketplace

# Useful commands:
\dt                     # List all tables
\d "User"              # Describe User table
\d "Post"              # Describe Post table
SELECT * FROM "User";  # View all users
SELECT * FROM "Post";  # View all posts
\q                     # Exit
```

### Create an Admin User

Once the backend is running, you'll need to manually set a user as ADMIN to access the admin panel:

```bash
# Access PostgreSQL
docker exec -it marketplace_postgres psql -U admin -d marketplace

# Set first user as admin (replace email)
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';

# Verify
SELECT email, role FROM "User";
\q
```

---

## 🧪 Testing the Application

### 1. Register a New User
- Go to **http://localhost:3001/auth/register**
- Create an account

### 2. Create a Post
- Click **"Create Post"** in navbar
- Fill in the form
- Use a sample image URL like: `https://picsum.photos/600/400`

### 3. Search & Filter
- Use the search bar on homepage
- Click the **Filters** button to filter by category/city/price

### 4. Admin Dashboard (After setting as ADMIN)
- Navigate to **http://localhost:3001/admin**
- View statistics
- Manage users and posts
- Trigger Elasticsearch reindex

---

## 🛠️ Troubleshooting

### Database Migration Failed

If `npx prisma db push` fails with permission errors:

```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait 5 seconds, then try again
cd apps/api
npx prisma db push
```

### Elasticsearch Not Working

```bash
# Check if running
curl http://localhost:9200

# If not responding, restart
docker restart marketplace_elasticsearch
```

### Backend Dependencies Missing

If you see TypeScript errors about missing modules:

```bash
cd apps/api
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @elastic/elasticsearch ioredis class-validator class-transformer @nestjs/config
npm install --save-dev @types/passport-jwt @types/bcrypt
```

---

## 📁 Project URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |
| Elasticsearch | http://localhost:9200 |
| Redis | localhost:6379 |

---

## 🔑 Default Credentials

**PostgreSQL**:
- User: `admin`
- Password: `password`
- Database: `marketplace`

---

## 📝 Next Steps

1. **Fix pending issues**: Run the database migration successfully
2. **Test features**: Create posts, search, filter
3. **Set admin user**: Update role in database
4. **Access admin panel**: Manage users and posts
5. **Deploy**: Consider using Vercel (frontend) + Railway/Render (backend)

For detailed documentation, see [walkthrough.md](walkthrough.md)
