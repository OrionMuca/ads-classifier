# 🎨 Theme Guide

## Overview

8 professionally designed themes have been seeded into your database, each optimized for different use cases and user preferences.

## Available Themes

### 1. **Default** (Active) 🎯
**Color Palette:** Indigo Primary, Green Secondary, Amber Accent
- **Best For:** General marketplace, professional look
- **Personality:** Modern, trustworthy, balanced
- **Use Case:** Default theme for new installations
- **Accessibility:** ✅ High contrast, WCAG AA compliant

### 2. **Blue Ocean** 🌊
**Color Palette:** Blue Primary, Cyan Secondary, Sky Accent
- **Best For:** Trust-focused businesses, tech companies
- **Personality:** Clean, reliable, fresh
- **Use Case:** Professional services, B2B marketplaces
- **Accessibility:** ✅ Excellent contrast ratios

### 3. **Forest Green** 🌲
**Color Palette:** Green Primary, Emerald Secondary, Lime Accent
- **Best For:** Eco-friendly, nature, health & wellness
- **Personality:** Natural, growth-oriented, fresh
- **Use Case:** Organic products, outdoor gear, sustainability
- **Accessibility:** ✅ Good contrast, nature-friendly

### 4. **Sunset Warm** 🌅
**Color Palette:** Orange Primary, Red Secondary, Amber Accent
- **Best For:** Food, hospitality, creative industries
- **Personality:** Warm, inviting, energetic
- **Use Case:** Restaurants, art, fashion, lifestyle
- **Accessibility:** ✅ Warm tones, high visibility

### 5. **Purple Dream** 💜
**Color Palette:** Purple Primary, Pink Secondary, Violet Accent
- **Best For:** Creative, luxury, fashion
- **Personality:** Creative, luxurious, modern
- **Use Case:** Fashion, beauty, art, premium products
- **Accessibility:** ✅ Vibrant, good contrast

### 6. **Dark Mode** 🌙
**Color Palette:** Blue Primary (inverted), Teal Secondary, Cyan Accent
- **Best For:** Modern apps, night-time usage, tech-savvy users
- **Personality:** Modern, sleek, professional
- **Use Case:** Tech products, gaming, modern marketplaces
- **Accessibility:** ✅ Dark theme optimized, reduced eye strain

### 7. **Minimal Gray** ⚪
**Color Palette:** Gray Primary, Slate Secondary, Zinc Accent
- **Best For:** Professional, corporate, minimalist design
- **Personality:** Clean, sophisticated, neutral
- **Use Case:** B2B, professional services, corporate
- **Accessibility:** ✅ High contrast, professional appearance

### 8. **Rose Elegant** 🌹
**Color Palette:** Rose Primary, Fuchsia Secondary, Pink Accent
- **Best For:** Fashion, beauty, lifestyle, feminine brands
- **Personality:** Elegant, sophisticated, modern
- **Use Case:** Fashion, cosmetics, lifestyle products
- **Accessibility:** ✅ Elegant tones, good readability

## Theme Characteristics

### Color Psychology

Each theme is designed with color psychology in mind:

- **Blue tones** → Trust, reliability, professionalism
- **Green tones** → Growth, nature, health, sustainability
- **Orange/Red tones** → Energy, warmth, passion, appetite
- **Purple/Pink tones** → Creativity, luxury, elegance
- **Gray tones** → Neutrality, professionalism, sophistication
- **Dark themes** → Modern, sleek, reduced eye strain

### UX Best Practices

All themes follow these UX principles:

1. **High Contrast Ratios** - All text meets WCAG AA standards (4.5:1 minimum)
2. **Consistent Color System** - 50-900 shade system for flexibility
3. **Accessible Combinations** - Text colors chosen for readability
4. **Visual Hierarchy** - Primary, secondary, and accent colors create clear hierarchy
5. **Brand Consistency** - Cohesive color palettes throughout

## How to Use

### Via Admin Panel

1. Navigate to `/admin`
2. Click "Theme" in the sidebar
3. Select a theme from the list
4. Click "Activate" to apply

### Via API

```bash
# Get all themes
GET /theme

# Get active theme
GET /theme/active

# Activate a theme
POST /theme/:id/activate
```

### Programmatically

```typescript
// Activate a theme
await api.post(`/theme/${themeId}/activate`);

// Get active theme
const activeTheme = await api.get('/theme/active');
```

## Theme Structure

Each theme includes:

- **30 color shades** (Primary, Secondary, Accent × 10 shades each)
- **4 UI colors** (Background, Surface, Text Primary, Text Secondary)
- **2 branding fields** (Logo URL, Favicon URL - optional)

## Customization

You can:

1. **Edit existing themes** - Modify colors via admin panel
2. **Create new themes** - Start from scratch or duplicate existing
3. **Mix and match** - Combine colors from different themes
4. **Export/Import** - Save themes as JSON for backup

## Recommendations

### For Different Industries

- **E-commerce General:** Default or Blue Ocean
- **Fashion/Beauty:** Purple Dream or Rose Elegant
- **Food/Restaurant:** Sunset Warm
- **Tech/Software:** Dark Mode or Blue Ocean
- **Eco/Organic:** Forest Green
- **Corporate/B2B:** Minimal Gray or Blue Ocean
- **Creative/Art:** Purple Dream or Sunset Warm

### For Different User Bases

- **Young Adults:** Purple Dream, Rose Elegant, Dark Mode
- **Professionals:** Blue Ocean, Minimal Gray, Default
- **Eco-Conscious:** Forest Green
- **Creative:** Purple Dream, Sunset Warm
- **Traditional:** Default, Minimal Gray

## Testing Themes

1. **Preview in Admin Panel** - See theme colors in real-time
2. **Test on Different Devices** - Ensure colors work on mobile/desktop
3. **Check Accessibility** - Use browser dev tools to verify contrast
4. **User Testing** - Get feedback on color preferences

## Best Practices

1. **Start with Default** - Use as baseline
2. **Test Before Activating** - Preview changes first
3. **Consider Brand Identity** - Match your brand colors
4. **Think About Users** - Consider your target audience
5. **Maintain Contrast** - Always ensure text is readable
6. **Keep It Consistent** - Don't mix too many color schemes

## Technical Details

- **CSS Variables:** All colors injected as CSS variables
- **Tailwind Integration:** Works seamlessly with Tailwind classes
- **Real-time Updates:** Changes apply immediately
- **Caching:** Themes cached for 5 minutes
- **Fallback:** Default theme used if none active

---

**Last Updated:** 2025-01-23
**Total Themes:** 8
**Active Theme:** default

