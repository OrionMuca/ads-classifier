import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const themes = [
    {
        name: 'default',
        isActive: true,
        // Indigo Primary - Modern and professional
        primary50: '#eef2ff',
        primary100: '#e0e7ff',
        primary200: '#c7d2fe',
        primary300: '#a5b4fc',
        primary400: '#818cf8',
        primary500: '#6366f1',
        primary600: '#4f46e5',
        primary700: '#4338ca',
        primary800: '#3730a3',
        primary900: '#312e81',
        // Green Secondary - Success and growth
        secondary50: '#ecfdf5',
        secondary100: '#d1fae5',
        secondary200: '#a7f3d0',
        secondary300: '#6ee7b7',
        secondary400: '#34d399',
        secondary500: '#10b981',
        secondary600: '#059669',
        secondary700: '#047857',
        secondary800: '#065f46',
        secondary900: '#064e3b',
        // Amber Accent - Energy and attention
        accent50: '#fffbeb',
        accent100: '#fef3c7',
        accent200: '#fde68a',
        accent300: '#fcd34d',
        accent400: '#fbbf24',
        accent500: '#f59e0b',
        accent600: '#d97706',
        accent700: '#b45309',
        accent800: '#92400e',
        accent900: '#78350f',
        // UI Colors
        background: '#f8fafc',
        surface: '#ffffff',
        textPrimary: '#0f172a',
        textSecondary: '#64748b',
    },
    {
        name: 'blue-ocean',
        isActive: false,
        // Blue Primary - Trust and reliability
        primary50: '#eff6ff',
        primary100: '#dbeafe',
        primary200: '#bfdbfe',
        primary300: '#93c5fd',
        primary400: '#60a5fa',
        primary500: '#3b82f6',
        primary600: '#2563eb',
        primary700: '#1d4ed8',
        primary800: '#1e40af',
        primary900: '#1e3a8a',
        // Cyan Secondary - Fresh and modern
        secondary50: '#ecfeff',
        secondary100: '#cffafe',
        secondary200: '#a5f3fc',
        secondary300: '#67e8f9',
        secondary400: '#22d3ee',
        secondary500: '#06b6d4',
        secondary600: '#0891b2',
        secondary700: '#0e7490',
        secondary800: '#155e75',
        secondary900: '#164e63',
        // Sky Accent - Light and airy
        accent50: '#f0f9ff',
        accent100: '#e0f2fe',
        accent200: '#bae6fd',
        accent300: '#7dd3fc',
        accent400: '#38bdf8',
        accent500: '#0ea5e9',
        accent600: '#0284c7',
        accent700: '#0369a1',
        accent800: '#075985',
        accent900: '#0c4a6e',
        // UI Colors
        background: '#f0f9ff',
        surface: '#ffffff',
        textPrimary: '#0c4a6e',
        textSecondary: '#475569',
    },
    {
        name: 'forest-green',
        isActive: false,
        // Green Primary - Nature and growth
        primary50: '#f0fdf4',
        primary100: '#dcfce7',
        primary200: '#bbf7d0',
        primary300: '#86efac',
        primary400: '#4ade80',
        primary500: '#22c55e',
        primary600: '#16a34a',
        primary700: '#15803d',
        primary800: '#166534',
        primary900: '#14532d',
        // Emerald Secondary - Rich and vibrant
        secondary50: '#ecfdf5',
        secondary100: '#d1fae5',
        secondary200: '#a7f3d0',
        secondary300: '#6ee7b7',
        secondary400: '#34d399',
        secondary500: '#10b981',
        secondary600: '#059669',
        secondary700: '#047857',
        secondary800: '#065f46',
        secondary900: '#064e3b',
        // Lime Accent - Fresh and energetic
        accent50: '#f7fee7',
        accent100: '#ecfccb',
        accent200: '#d9f99d',
        accent300: '#bef264',
        accent400: '#a3e635',
        accent500: '#84cc16',
        accent600: '#65a30d',
        accent700: '#4a7c09',
        accent800: '#365314',
        accent900: '#1a2e05',
        // UI Colors
        background: '#f0fdf4',
        surface: '#ffffff',
        textPrimary: '#14532d',
        textSecondary: '#475569',
    },
    {
        name: 'sunset-warm',
        isActive: false,
        // Orange Primary - Warm and inviting
        primary50: '#fff7ed',
        primary100: '#ffedd5',
        primary200: '#fed7aa',
        primary300: '#fdba74',
        primary400: '#fb923c',
        primary500: '#f97316',
        primary600: '#ea580c',
        primary700: '#c2410c',
        primary800: '#9a3412',
        primary900: '#7c2d12',
        // Red Secondary - Passion and energy
        secondary50: '#fef2f2',
        secondary100: '#fee2e2',
        secondary200: '#fecaca',
        secondary300: '#fca5a5',
        secondary400: '#f87171',
        secondary500: '#ef4444',
        secondary600: '#dc2626',
        secondary700: '#b91c1c',
        secondary800: '#991b1b',
        secondary900: '#7f1d1d',
        // Amber Accent - Golden warmth
        accent50: '#fffbeb',
        accent100: '#fef3c7',
        accent200: '#fde68a',
        accent300: '#fcd34d',
        accent400: '#fbbf24',
        accent500: '#f59e0b',
        accent600: '#d97706',
        accent700: '#b45309',
        accent800: '#92400e',
        accent900: '#78350f',
        // UI Colors
        background: '#fff7ed',
        surface: '#ffffff',
        textPrimary: '#7c2d12',
        textSecondary: '#78716c',
    },
    {
        name: 'purple-dream',
        isActive: false,
        // Purple Primary - Creative and luxurious
        primary50: '#faf5ff',
        primary100: '#f3e8ff',
        primary200: '#e9d5ff',
        primary300: '#d8b4fe',
        primary400: '#c084fc',
        primary500: '#a855f7',
        primary600: '#9333ea',
        primary700: '#7e22ce',
        primary800: '#6b21a8',
        primary900: '#581c87',
        // Pink Secondary - Playful and modern
        secondary50: '#fdf2f8',
        secondary100: '#fce7f3',
        secondary200: '#fbcfe8',
        secondary300: '#f9a8d4',
        secondary400: '#f472b6',
        secondary500: '#ec4899',
        secondary600: '#db2777',
        secondary700: '#be185d',
        secondary800: '#9f1239',
        secondary900: '#831843',
        // Violet Accent - Rich and deep
        accent50: '#f5f3ff',
        accent100: '#ede9fe',
        accent200: '#ddd6fe',
        accent300: '#c4b5fd',
        accent400: '#a78bfa',
        accent500: '#8b5cf6',
        accent600: '#7c3aed',
        accent700: '#6d28d9',
        accent800: '#5b21b6',
        accent900: '#4c1d95',
        // UI Colors
        background: '#faf5ff',
        surface: '#ffffff',
        textPrimary: '#581c87',
        textSecondary: '#6b7280',
    },
    {
        name: 'dark-mode',
        isActive: false,
        // Blue Primary - Modern dark theme
        primary50: '#1e3a8a',
        primary100: '#1e40af',
        primary200: '#1d4ed8',
        primary300: '#2563eb',
        primary400: '#3b82f6',
        primary500: '#60a5fa',
        primary600: '#93c5fd',
        primary700: '#bfdbfe',
        primary800: '#dbeafe',
        primary900: '#eff6ff',
        // Teal Secondary - Fresh contrast
        secondary50: '#164e63',
        secondary100: '#155e75',
        secondary200: '#0e7490',
        secondary300: '#0891b2',
        secondary400: '#06b6d4',
        secondary500: '#22d3ee',
        secondary600: '#67e8f9',
        secondary700: '#a5f3fc',
        secondary800: '#cffafe',
        secondary900: '#ecfeff',
        // Cyan Accent - Bright highlights
        accent50: '#0c4a6e',
        accent100: '#075985',
        accent200: '#0369a1',
        accent300: '#0284c7',
        accent400: '#0ea5e9',
        accent500: '#38bdf8',
        accent600: '#7dd3fc',
        accent700: '#bae6fd',
        accent800: '#e0f2fe',
        accent900: '#f0f9ff',
        // UI Colors - Dark theme
        background: '#0f172a',
        surface: '#1e293b',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
    },
    {
        name: 'minimal-gray',
        isActive: false,
        // Gray Primary - Neutral and professional
        primary50: '#f9fafb',
        primary100: '#f3f4f6',
        primary200: '#e5e7eb',
        primary300: '#d1d5db',
        primary400: '#9ca3af',
        primary500: '#6b7280',
        primary600: '#4b5563',
        primary700: '#374151',
        primary800: '#1f2937',
        primary900: '#111827',
        // Slate Secondary - Sophisticated
        secondary50: '#f8fafc',
        secondary100: '#f1f5f9',
        secondary200: '#e2e8f0',
        secondary300: '#cbd5e1',
        secondary400: '#94a3b8',
        secondary500: '#64748b',
        secondary600: '#475569',
        secondary700: '#334155',
        secondary800: '#1e293b',
        secondary900: '#0f172a',
        // Zinc Accent - Subtle highlights
        accent50: '#fafafa',
        accent100: '#f4f4f5',
        accent200: '#e4e4e7',
        accent300: '#d4d4d8',
        accent400: '#a1a1aa',
        accent500: '#71717a',
        accent600: '#52525b',
        accent700: '#3f3f46',
        accent800: '#27272a',
        accent900: '#18181b',
        // UI Colors
        background: '#ffffff',
        surface: '#f9fafb',
        textPrimary: '#111827',
        textSecondary: '#6b7280',
    },
    {
        name: 'rose-elegant',
        isActive: false,
        // Rose Primary - Elegant and sophisticated
        primary50: '#fff1f2',
        primary100: '#ffe4e6',
        primary200: '#fecdd3',
        primary300: '#fda4af',
        primary400: '#fb7185',
        primary500: '#f43f5e',
        primary600: '#e11d48',
        primary700: '#be123c',
        primary800: '#9f1239',
        primary900: '#881337',
        // Fuchsia Secondary - Vibrant and modern
        secondary50: '#fdf4ff',
        secondary100: '#fae8ff',
        secondary200: '#f5d0fe',
        secondary300: '#f0abfc',
        secondary400: '#e879f9',
        secondary500: '#d946ef',
        secondary600: '#c026d3',
        secondary700: '#a21caf',
        secondary800: '#86198f',
        secondary900: '#701a75',
        // Pink Accent - Soft and warm
        accent50: '#fdf2f8',
        accent100: '#fce7f3',
        accent200: '#fbcfe8',
        accent300: '#f9a8d4',
        accent400: '#f472b6',
        accent500: '#ec4899',
        accent600: '#db2777',
        accent700: '#be185d',
        accent800: '#9f1239',
        accent900: '#831843',
        // UI Colors
        background: '#fff1f2',
        surface: '#ffffff',
        textPrimary: '#881337',
        textSecondary: '#78716c',
    },
];

async function main() {
    console.log('🎨 Starting theme seed...');

    // Check if themes already exist
    const existingThemes = await prisma.themeConfig.findMany();
    if (existingThemes.length > 0) {
        console.log(`⚠️  Found ${existingThemes.length} existing themes. Skipping seed.`);
        console.log('   To reseed, delete existing themes first.');
        return;
    }

    // Create themes
    for (const theme of themes) {
        const created = await prisma.themeConfig.create({
            data: theme,
        });
        console.log(`✅ Created theme: ${created.name}${created.isActive ? ' (ACTIVE)' : ''}`);
    }

    console.log(`\n🎉 Successfully seeded ${themes.length} themes!`);
    console.log('\n📋 Available themes:');
    themes.forEach((theme) => {
        console.log(`   - ${theme.name}${theme.isActive ? ' (active)' : ''}`);
    });
    console.log('\n💡 To activate a theme, use the admin panel or API:');
    console.log('   POST /theme/:id/activate');
}

main()
    .catch((e) => {
        console.error('❌ Theme seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

