import React from 'react';
import {
    DevicePhoneMobileIcon,
    ComputerDesktopIcon,
    HomeIcon,
    TruckIcon,
    TagIcon,
    BookOpenIcon,
    PuzzlePieceIcon,
    MusicalNoteIcon,
    CameraIcon,
    HeartIcon,
    WrenchScrewdriverIcon,
    SparklesIcon,
    BuildingStorefrontIcon,
    GiftIcon,
    AcademicCapIcon,
    BeakerIcon,
    PaintBrushIcon,
    CubeIcon,
    RectangleStackIcon,
    Squares2X2Icon,
} from '@heroicons/react/24/outline';

// Category name to icon mapping
// This maps category names (case-insensitive) to Heroicons
// Supports both English and Albanian names
const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Electronics & Technology
    'electronics': DevicePhoneMobileIcon,
    'elektronikë': DevicePhoneMobileIcon,
    'elektronike': DevicePhoneMobileIcon,
    'technology': ComputerDesktopIcon,
    'teknologji': ComputerDesktopIcon,
    'phones': DevicePhoneMobileIcon,
    'telefona': DevicePhoneMobileIcon,
    'celularë': DevicePhoneMobileIcon,
    'celulare': DevicePhoneMobileIcon,
    'computers': ComputerDesktopIcon,
    'kompjutera': ComputerDesktopIcon,
    'laptops': ComputerDesktopIcon,
    'laptop': ComputerDesktopIcon,
    'laptopë': ComputerDesktopIcon,
    'laptope': ComputerDesktopIcon,
    'pc': ComputerDesktopIcon,
    'tablets': DevicePhoneMobileIcon,
    'tableta': DevicePhoneMobileIcon,
    'kamera': CameraIcon,
    'foto': CameraIcon,
    'audio': MusicalNoteIcon,
    'tv': DevicePhoneMobileIcon,
    
    // Home & Furniture
    'home': HomeIcon,
    'shtëpi': HomeIcon,
    'shtepi': HomeIcon,
    'furniture': HomeIcon,
    'mobilje': HomeIcon,
    'household': HomeIcon,
    'shtëpiake': HomeIcon,
    'shtepiake': HomeIcon,
    'appliances': HomeIcon,
    'pajisje': HomeIcon,
    'kopsht': HomeIcon,
    'elektroshtëpiake': HomeIcon,
    'elektroshtepiake': HomeIcon,
    'prona': HomeIcon,
    'apartamente': HomeIcon,
    'toka': HomeIcon,
    'truall': HomeIcon,
    
    // Vehicles
    'vehicles': TruckIcon,
    'automjete': TruckIcon,
    'cars': TruckIcon,
    'makina': TruckIcon,
    'automotive': TruckIcon,
    'motorcycles': TruckIcon,
    'motocikleta': TruckIcon,
    'motoçikleta': TruckIcon,
    'motocikleta': TruckIcon,
    'bikes': TruckIcon,
    'bicikleta': TruckIcon,
    'pjesë': WrenchScrewdriverIcon,
    'pjese': WrenchScrewdriverIcon,
    'këmbimi': WrenchScrewdriverIcon,
    'kembimi': WrenchScrewdriverIcon,
    
    // Fashion & Clothing
    'fashion': TagIcon,
    'modë': TagIcon,
    'mode': TagIcon,
    'clothing': TagIcon,
    'veshje': TagIcon,
    'apparel': TagIcon,
    'accessories': GiftIcon,
    'aksesore': GiftIcon,
    
    // Books & Media
    'books': BookOpenIcon,
    'libra': BookOpenIcon,
    'media': BookOpenIcon,
    'education': AcademicCapIcon,
    'arsim': AcademicCapIcon,
    'edukim': AcademicCapIcon,
    
    // Games & Toys
    'games': PuzzlePieceIcon,
    'lojëra': PuzzlePieceIcon,
    'lojera': PuzzlePieceIcon,
    'toys': PuzzlePieceIcon,
    'lodra': PuzzlePieceIcon,
    'gaming': PuzzlePieceIcon,
    'sport': PuzzlePieceIcon,
    'hobi': PuzzlePieceIcon,
    
    // Music & Instruments
    'music': MusicalNoteIcon,
    'muzikë': MusicalNoteIcon,
    'muzike': MusicalNoteIcon,
    'instruments': MusicalNoteIcon,
    'instrumente': MusicalNoteIcon,
    
    // Photography
    'photography': CameraIcon,
    'fotografi': CameraIcon,
    'cameras': CameraIcon,
    'kamera': CameraIcon,
    
    // Health & Beauty
    'health': HeartIcon,
    'shëndet': HeartIcon,
    'shendet': HeartIcon,
    'beauty': SparklesIcon,
    'bukuri': SparklesIcon,
    'cosmetics': SparklesIcon,
    'kozmetikë': SparklesIcon,
    'kozmetike': SparklesIcon,
    
    // Tools & DIY
    'tools': WrenchScrewdriverIcon,
    'mjet': WrenchScrewdriverIcon,
    'diy': WrenchScrewdriverIcon,
    'hardware': WrenchScrewdriverIcon,
    'harduer': WrenchScrewdriverIcon,
    
    // Business & Services
    'business': BuildingStorefrontIcon,
    'biznes': BuildingStorefrontIcon,
    'services': BuildingStorefrontIcon,
    'shërbime': BuildingStorefrontIcon,
    'sherbime': BuildingStorefrontIcon,
    
    // Gifts & Collectibles
    'gifts': GiftIcon,
    'dhurata': GiftIcon,
    'collectibles': GiftIcon,
    
    // Science & Lab
    'science': BeakerIcon,
    'shkencë': BeakerIcon,
    'shkence': BeakerIcon,
    'laboratory': BeakerIcon,
    'laborator': BeakerIcon,
    
    // Art & Crafts
    'art': PaintBrushIcon,
    'art': PaintBrushIcon,
    'arte': PaintBrushIcon,
    'crafts': PaintBrushIcon,
    'artizanat': PaintBrushIcon,
    
    // General/Default
    'general': CubeIcon,
    'i përgjithshëm': CubeIcon,
    'i pergjithshem': CubeIcon,
    'other': RectangleStackIcon,
    'tjetër': RectangleStackIcon,
    'tjeter': RectangleStackIcon,
    'misc': Squares2X2Icon,
};

/**
 * Get icon component for a category name
 * @param categoryName - The name of the category
 * @returns Icon component or default icon
 */
export function getCategoryIcon(categoryName?: string | null): React.ComponentType<{ className?: string }> {
    if (!categoryName) {
        return Squares2X2Icon; // Default icon
    }

    // Normalize: lowercase, trim, remove accents/diacritics for better matching
    const normalizedName = categoryName
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
    
    // Direct match
    if (categoryIconMap[normalizedName]) {
        return categoryIconMap[normalizedName];
    }
    
    // Partial match (e.g., "Electronics & Tech" contains "electronics")
    // Check if category name contains any key or vice versa
    for (const [key, Icon] of Object.entries(categoryIconMap)) {
        const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizedName.includes(normalizedKey) || normalizedKey.includes(normalizedName)) {
            return Icon;
        }
    }
    
    // Try matching first word (for compound names like "Elektronikë & Teknologji")
    const firstWord = normalizedName.split(/\s+/)[0];
    if (firstWord && categoryIconMap[firstWord]) {
        return categoryIconMap[firstWord];
    }
    
    // Default fallback
    return Squares2X2Icon;
}

/**
 * Render category icon as a React component
 */
export function CategoryIcon({ 
    categoryName, 
    className = 'w-5 h-5' 
}: { 
    categoryName?: string | null; 
    className?: string;
}) {
    const Icon = getCategoryIcon(categoryName);
    return <Icon className={className} />;
}

