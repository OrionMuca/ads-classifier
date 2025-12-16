# Test User Credentials

## 🔐 Login Credentials

### Admin User
- **Email**: `admin@marketplace.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Access**: Full admin panel + all user features
- **Phone**: +355691234567

### Regular User (for testing)
- **Email**: `user@marketplace.com`
- **Password**: `admin123`
- **Role**: USER
- **Access**: User features only (no admin panel)
- **Phone**: +355697654321
- **Profile**: Pre-filled with WhatsApp, Instagram, Bio

---

## ✅ Verified Working (Backend Test)

```bash
# Test completed: 2024-12-11
curl -X POST http://192.168.1.3:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@marketplace.com","password":"admin123"}'

# Result: ✅ SUCCESS
# Response includes:
# - user object with id, email, name, role: "USER"
# - accessToken (JWT)
# - refreshToken (JWT)
```

---

## 🧪 Testing Guide

### Test Regular User Features:
1. **Login** - Go to `/auth/login` and use `user@marketplace.com` / `admin123`
2. **Profile** - Should see profile without admin button
3. **Create Post** - Test creating a new product listing
4. **My Posts** - View posts created by this user
5. **Saved Posts** - Save/unsave other products
6. **Messages** - Access messages page (coming soon feature)
7. **Logout** - Test logout (mobile header icon or desktop button)
8. **No Admin Access** - Should NOT be able to access `/admin`

### Test Admin User Features:
1. **Login** - Use `admin@marketplace.com` / `admin123`
2. **Admin Panel** - Should see admin button in profile
3. **Admin CRUD** - Test managing users, posts, categories, locations, zones, ads
4. **All User Features** - Admin can also do everything a regular user can

---

## 🔧 Troubleshooting

### If Login Fails:

1. **Check Backend is Running**:
   ```bash
   # Should see backend logs
   cd apps/api
   npm run start:dev
   ```

2. **Check Frontend Environment**:
   ```bash
   # Should show: NEXT_PUBLIC_API_URL=http://192.168.1.3:3000
   cat apps/web/.env.local
   ```

3. **Verify User Exists in Database**:
   ```bash
   # Run Prisma Studio
   cd apps/api
   npx prisma studio
   # Open http://localhost:5555 and check Users table
   ```

4. **Re-seed Database** (if user doesn't exist):
   ```bash
   cd apps/api
   npm run seed
   ```

5. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for API errors in Console tab
   - Check Network tab for failed requests

---

## 🌐 Network Configuration

**Current Setup**:
- Backend API: `http://192.168.1.3:3000`
- Frontend: `http://192.168.1.3:3001` (or wherever Next.js is running)

**For Mobile Testing**:
- Make sure your mobile device is on the same WiFi network
- Access: `http://192.168.1.3:3001`
- The app will work on mobile with this configuration

**To Change to Localhost** (desktop only):
```bash
# Edit apps/api/src/main.ts
const host = '0.0.0.0'; # or 'localhost'

# Edit apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📝 Notes

- Both users use the same password (`admin123`) for easy testing
- Passwords are hashed with bcrypt (10 rounds)
- The test user has a pre-filled profile with sample data
- All Albanian translations are applied to both user types
- Session is JWT-based, not cookie-based

---

## ✨ Next Steps

1. Try logging in as `user@marketplace.com`
2. If it still doesn't work, check the browser console for errors
3. Share the error message for further debugging
4. Test both mobile and desktop views




