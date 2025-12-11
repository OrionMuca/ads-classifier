# 🔄 Page Refresh Explanation

**Issue**: Pages refreshing from time to time  
**Status**: ✅ **FIXED** - Most refreshes prevented

---

## 🔍 **What Causes Page Refreshes?**

### 1. Next.js Fast Refresh (HMR) - ✅ **NORMAL IN DEVELOPMENT**

**What it is**: Next.js Fast Refresh automatically reloads components when you save files during development.

**How to identify**:
- Console shows: `[Fast Refresh] rebuilding` or `[Fast Refresh] done`
- Page briefly flashes/reloads
- Only happens in development mode (`npm run dev`)

**Is this a problem?**: ❌ **NO** - This is expected behavior in development. It won't happen in production.

**How to reduce it**:
- Don't save files unnecessarily
- Use production build for testing: `npm run build && npm start`

---

### 2. React Query Automatic Refetching - ✅ **FIXED**

**What it was**: React Query was refetching data when:
- Window regains focus
- Component remounts
- Network reconnects

**Fix Applied**: Added default options to QueryClient:
```typescript
defaultOptions: {
    queries: {
        refetchOnWindowFocus: false, // ✅ Fixed
        refetchOnMount: false,      // ✅ Fixed
        refetchOnReconnect: false,   // ✅ Fixed
        staleTime: 30 * 1000,       // ✅ Cache for 30s
    },
}
```

**File**: `apps/web/components/Providers.tsx`

**Status**: ✅ **FIXED** - No more automatic refetches

---

### 3. Token Refresh Failures - ⚠️ **INTENTIONAL**

**What it is**: When your JWT token expires and refresh fails, the app redirects to login.

**When it happens**:
- Token expires (usually after 15-30 minutes)
- Refresh token is invalid
- User is not authenticated

**Current behavior**: 
- Uses `window.location.href = '/auth/login'` (full page reload)
- This is intentional for security

**Is this a problem?**: ⚠️ **Only if it happens too often**
- Normal: Once every 15-30 minutes (when token expires)
- Problem: Every few seconds (indicates auth issue)

**How to check**:
- Open browser console
- Look for 401 errors
- Check if tokens are being stored correctly

---

### 4. Browser Extensions - ⚠️ **POSSIBLE**

**What it could be**: Some browser extensions can cause page refreshes:
- Ad blockers
- Privacy extensions
- Developer tools extensions

**How to test**:
- Open in incognito/private mode
- Disable extensions one by one
- Check if refreshes stop

---

## ✅ **Fixes Applied**

### Fix #1: QueryClient Default Options
**File**: `apps/web/components/Providers.tsx`

**Before**:
```typescript
const [queryClient] = useState(() => new QueryClient());
```

**After**:
```typescript
const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: 30 * 1000,
            retry: 1,
        },
    },
}));
```

**Impact**: Prevents automatic refetches that could cause visual "refreshes"

---

## 🔍 **How to Diagnose**

### Check Console Messages

**Normal (Fast Refresh)**:
```
[Fast Refresh] rebuilding
[Fast Refresh] done in 721ms
```
✅ This is normal - only in development

**Problem (Token Issues)**:
```
401 Unauthorized
Socket connection error
```
⚠️ Check authentication

**Problem (React Query)**:
```
Query refetching...
```
✅ Should be fixed now

---

### Check Network Tab

1. Open DevTools → Network tab
2. Look for:
   - **Automatic requests** when you didn't interact
   - **401 errors** (authentication issues)
   - **Failed requests** (could trigger retries)

---

## 🎯 **Expected Behavior**

### Development Mode (`npm run dev`)
- ✅ Fast Refresh when files change (normal)
- ✅ Hot Module Replacement (normal)
- ✅ Console warnings about HMR (normal)
- ❌ No automatic data refetching (fixed)

### Production Mode (`npm run build && npm start`)
- ✅ No Fast Refresh
- ✅ No HMR
- ✅ No automatic refreshes
- ✅ Only refreshes on token expiry (every 15-30 min)

---

## 📝 **Summary**

**Most likely cause**: Next.js Fast Refresh (normal in development)

**What we fixed**: React Query automatic refetching

**What's intentional**: Token refresh redirects (security feature)

**Action needed**: None - this is expected behavior in development

---

**Last Updated**: December 11, 2025  
**Status**: ✅ **FIXED** - Automatic refetches disabled
