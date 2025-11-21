# PostgreSQL Configuration - Dual Setup

## 🎯 Current Setup

You now have **TWO PostgreSQL databases** running simultaneously:

| Database | Port | Purpose | Access |
|----------|------|---------|--------|
| **Local PostgreSQL** | 5432 | Your Mac installation (Homebrew) | `psql postgres` |
| **Docker PostgreSQL** | 5433 | Marketplace project (containerized) | `docker exec -it marketplace_postgres psql -U admin -d marketplace` |

---

## ✅ Why This Configuration?

### Benefits:
1. **No conflicts** - Both can run at the same time
2. **Project isolation** - Marketplace uses Docker (5433), other projects use local (5432)
3. **Data safety** - Your existing local databases are untouched
4. **Easy switching** - No need to stop/start services constantly
5. **Standard practice** - Docker on non-standard ports is common in development

---

## 📊 How Data is Stored

### Local PostgreSQL (Port 5432)
- **Data location**: `/usr/local/var/postgresql@14/`
- **Managed by**: Homebrew
- **Control**: `brew services start/stop postgresql@14`
- **Your existing databases** are stored here

### Docker PostgreSQL (Port 5433)
- **Data location**: Docker volume `ads-classifier_postgres_data`
- **Managed by**: Docker Compose
- **Control**: `docker-compose up/down`
- **Marketplace database** is stored here

**Important**: Docker volume data persists even if you delete containers!

---

## 🔧 Common Commands

### Check What's Running
```bash
# Check both ports
lsof -i :5432 -i :5433

# Expected output:
# postgres  (PID) user ... localhost:5432  (Local)
# com.docke (PID) user ... *:5433         (Docker)
```

### Access Local PostgreSQL (Port 5432)
```bash
# Connect to your local databases
psql postgres

# List your databases
\l

# Connect to specific database
psql your_database_name
```

### Access Docker PostgreSQL (Port 5433)
```bash
# Connect to marketplace database
docker exec -it marketplace_postgres psql -U admin -d marketplace

# List tables
\dt

# Query data
SELECT * FROM "User";
```

### Start/Stop Services
```bash
# Local PostgreSQL
brew services start postgresql@14
brew services stop postgresql@14
brew services restart postgresql@14

# Docker PostgreSQL
cd /Users/user/Desktop/Templates/ads-classifier
docker-compose up -d
docker-compose down
docker-compose restart postgres
```

---

## 🔍 Troubleshooting

### "Port 5432 already in use"
This is normal - your local PostgreSQL uses 5432. Docker uses 5433.

### "Can't connect to marketplace database"
Check if Docker is running:
```bash
docker ps | grep marketplace_postgres
```

If not running:
```bash
cd /Users/user/Desktop/Templates/ads-classifier
docker-compose up -d
```

### "Lost my local databases"
Don't worry! They're safe at port 5432. Access with:
```bash
psql postgres
\l  # List all databases
```

### Reset Docker Database (if needed)
```bash
# CAUTION: This deletes ALL Docker data
docker-compose down -v
docker-compose up -d
cd apps/api
npx prisma db push
```

---

## 📝 Connection Strings

### For Marketplace Project
```
DATABASE_URL="postgresql://admin:password@localhost:5433/marketplace?schema=public"
```

### For Other Projects (using local)
```
DATABASE_URL="postgresql://YOUR_USER@localhost:5432/your_database"
```

---

## 🚀 Quick Start Guide

### Day-to-day Development:

1. **Start Docker services** (run once, they stay running):
   ```bash
   cd /Users/user/Desktop/Templates/ads-classifier
   docker-compose up -d
   ```

2. **Your local PostgreSQL** (already running via Homebrew)
   ```bash
   # Check status
   brew services list | grep postgresql
   ```

3. **Work on marketplace**:
   ```bash
   # Backend connects to Docker (port 5433)
   cd apps/api && npm run start:dev
   
   # Frontend
   cd apps/web && npm run dev
   ```

4. **Work on other projects**:
   - They continue using your local PostgreSQL (port 5432)
   - No changes needed!

---

## 💡 Best Practices

1. **Use Docker for marketplace** - Keeps project self-contained
2. **Use local for everything else** - Faster, no container overhead
3. **Don't mix them** - One database per project
4. **Back up important data** - Use `pg_dump` for local DBs
5. **Check what's running** - `docker ps` and `brew services list`

---

## Summary

✅ **Local PostgreSQL (5432)**: Your existing databases, managed by Homebrew  
✅ **Docker PostgreSQL (5433)**: Marketplace project, managed by Docker  
✅ **Both can run together**: No conflicts, clean separation  
✅ **Data is safe**: Each has its own storage location
