# Theme Module

Complete theme management system for customizing the marketplace appearance.

## Features

- ✅ Create, read, update, and delete themes
- ✅ Activate/deactivate themes (only one active at a time)
- ✅ Duplicate themes
- ✅ Full color palette customization (Primary, Secondary, Accent colors)
- ✅ UI color customization (Background, Surface, Text colors)
- ✅ Branding customization (Logo, Favicon URLs)
- ✅ Public endpoint to get active theme
- ✅ Admin-only endpoints for theme management

## API Endpoints

### Public Endpoints

#### Get Active Theme
```
GET /theme/active
```
Returns the currently active theme configuration.

**Response:**
```json
{
  "id": "uuid",
  "name": "default",
  "isActive": true,
  "primary50": "#eef2ff",
  "primary100": "#e0e7ff",
  // ... all color fields
  "background": "#f8fafc",
  "surface": "#ffffff",
  "textPrimary": "#0f172a",
  "textSecondary": "#64748b",
  "logoUrl": null,
  "faviconUrl": null
}
```

### Admin Endpoints (Require JWT + Admin role)

#### Get All Themes
```
GET /theme
```

#### Get Theme by ID
```
GET /theme/:id
```

#### Create Theme
```
POST /theme
Content-Type: application/json

{
  "name": "dark-blue",
  "isActive": false,
  "primary500": "#3b82f6",
  "primary600": "#2563eb",
  // ... other color fields
}
```

#### Update Theme
```
PATCH /theme/:id
Content-Type: application/json

{
  "primary500": "#3b82f6",
  "primary600": "#2563eb"
}
```

#### Activate Theme
```
POST /theme/:id/activate
```
Activates the theme and deactivates all others.

#### Deactivate Theme
```
POST /theme/:id/deactivate
```

#### Duplicate Theme
```
POST /theme/:id/duplicate
Content-Type: application/json

{
  "name": "dark-blue-copy"
}
```

#### Delete Theme
```
DELETE /theme/:id
```
Cannot delete the active theme.

## Usage Examples

### Creating a Custom Theme

```typescript
// Create a dark theme
const darkTheme = {
  name: "dark-theme",
  isActive: false,
  primary50: "#1e1b4b",
  primary100: "#312e81",
  primary500: "#6366f1",
  primary600: "#4f46e5",
  background: "#0f172a",
  surface: "#1e293b",
  textPrimary: "#f1f5f9",
  textSecondary: "#cbd5e1",
  // ... other colors
};

await api.post('/theme', darkTheme);
```

### Activating a Theme

```typescript
// Activate theme by ID
await api.post(`/theme/${themeId}/activate`);
```

### Getting Active Theme (Frontend)

```typescript
// Get active theme for frontend
const activeTheme = await api.get('/theme/active');

// Apply theme colors to CSS variables
Object.entries(activeTheme).forEach(([key, value]) => {
  if (key.startsWith('primary') || key.startsWith('secondary') || key.startsWith('accent')) {
    document.documentElement.style.setProperty(`--${key}`, value);
  }
});
```

## Color Fields

### Primary Colors
- `primary50` through `primary900` (10 shades)

### Secondary Colors
- `secondary50` through `secondary900` (10 shades)

### Accent Colors
- `accent50` through `accent900` (10 shades)

### UI Colors
- `background` - Main background color
- `surface` - Card/surface background color
- `textPrimary` - Primary text color
- `textSecondary` - Secondary text color

### Branding
- `logoUrl` - Logo image URL
- `faviconUrl` - Favicon URL

## Validation

- All color fields must be valid hex colors (format: `#RRGGBB`)
- Theme name must be unique
- Only one theme can be active at a time
- Cannot delete active theme
- Logo and favicon URLs must be valid URLs

## Default Theme

If no theme is active, the service returns a default theme configuration with standard Tailwind indigo/green/amber colors.

## Integration with Frontend

The frontend should:
1. Fetch active theme on app load: `GET /theme/active`
2. Inject theme colors as CSS variables
3. Use CSS variables in Tailwind classes or custom CSS
4. Update theme when admin changes it (via WebSocket or polling)

Example CSS variable injection:
```typescript
const theme = await fetch('/api/theme/active').then(r => r.json());

// Set CSS variables
document.documentElement.style.setProperty('--primary-500', theme.primary500);
document.documentElement.style.setProperty('--primary-600', theme.primary600);
// ... etc
```

