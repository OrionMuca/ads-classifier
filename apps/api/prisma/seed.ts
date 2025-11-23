import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting full database seed...\n');

    // Step 1: Truncate and seed categories, locations, admin user
    console.log('📝 Step 1: Truncating and seeding categories, locations, and admin user...');
    
    // Truncate in correct order
    await prisma.post.deleteMany({});
    await prisma.ad.deleteMany({});
    await prisma.category.deleteMany({});
    
    // Seed admin user
    await prisma.user.upsert({
        where: { email: 'admin@marketplace.com' },
        update: {},
        create: {
            id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            email: 'admin@marketplace.com',
            password: '$2b$10$vdkEvVmigMzyI.OdEwHSCuSqQkFccYCAgx.VUsqsUOTYjGLjmIUqq', // admin123
            name: 'Admin User',
            phone: '+355691234567',
            role: 'ADMIN',
        },
    });

    // Seed main categories
    const elektronike = await prisma.category.upsert({
        where: { slug: 'elektronike' },
        update: {},
        create: { name: 'Elektronikë', slug: 'elektronike', icon: '📱' },
    });

    const automjete = await prisma.category.upsert({
        where: { slug: 'automjete' },
        update: {},
        create: { name: 'Automjete', slug: 'automjete', icon: '🚗' },
    });

    const prona = await prisma.category.upsert({
        where: { slug: 'prona' },
        update: {},
        create: { name: 'Prona', slug: 'prona', icon: '🏠' },
    });

    const shtepiKopsht = await prisma.category.upsert({
        where: { slug: 'shtepi-kopsht' },
        update: {},
        create: { name: 'Shtëpi & Kopsht', slug: 'shtepi-kopsht', icon: '🛋️' },
    });

    const mode = await prisma.category.upsert({
        where: { slug: 'mode' },
        update: {},
        create: { name: 'Modë', slug: 'mode', icon: '👕' },
    });

    const sportHobi = await prisma.category.upsert({
        where: { slug: 'sport-hobi' },
        update: {},
        create: { name: 'Sport & Hobi', slug: 'sport-hobi', icon: '⚽' },
    });

    // Seed subcategories
    const subcategories = [
        { parentId: elektronike.id, name: 'Celularë', slug: 'celulare' },
        { parentId: elektronike.id, name: 'Laptopë & PC', slug: 'laptop-pc' },
        { parentId: elektronike.id, name: 'Kamera & Foto', slug: 'kamera' },
        { parentId: elektronike.id, name: 'Audio & TV', slug: 'audio-tv' },
        { parentId: automjete.id, name: 'Makina', slug: 'makina' },
        { parentId: automjete.id, name: 'Motoçikleta', slug: 'motocikleta' },
        { parentId: automjete.id, name: 'Pjesë Këmbimi', slug: 'pjese-kembimi' },
        { parentId: prona.id, name: 'Apartamente në Shitje', slug: 'apartamente-shitje' },
        { parentId: prona.id, name: 'Apartamente me Qira', slug: 'apartamente-qira' },
        { parentId: prona.id, name: 'Toka & Truall', slug: 'toka' },
        { parentId: shtepiKopsht.id, name: 'Mobilje', slug: 'mobilje' },
        { parentId: shtepiKopsht.id, name: 'Elektroshtëpiake', slug: 'elektroshtepiake' },
        { parentId: shtepiKopsht.id, name: 'Kopsht', slug: 'kopsht' },
    ];

    for (const subcat of subcategories) {
        await prisma.category.upsert({
            where: { slug: subcat.slug },
            update: { parentId: subcat.parentId },
            create: { ...subcat },
        });
    }

    // Seed locations
    const locations = [
        { city: 'Tiranë', country: 'Albania', latitude: 41.3275, longitude: 19.8187, weight: 100, hasZones: true },
        { city: 'Durrës', country: 'Albania', latitude: 41.3239, longitude: 19.4561, weight: 95, hasZones: true },
        { city: 'Vlorë', country: 'Albania', latitude: 40.4686, longitude: 19.4914, weight: 90, hasZones: false },
        { city: 'Shkodër', country: 'Albania', latitude: 42.0683, longitude: 19.5133, weight: 89, hasZones: false },
        { city: 'Elbasan', country: 'Albania', latitude: 41.1125, longitude: 20.0822, weight: 85, hasZones: false },
        { city: 'Korçë', country: 'Albania', latitude: 40.6186, longitude: 20.7808, weight: 84, hasZones: false },
        { city: 'Fier', country: 'Albania', latitude: 40.7239, longitude: 19.5628, weight: 83, hasZones: false },
        { city: 'Berat', country: 'Albania', latitude: 40.7058, longitude: 19.9522, weight: 82, hasZones: false },
        { city: 'Lushnjë', country: 'Albania', latitude: 40.9419, longitude: 19.7050, weight: 81, hasZones: false },
        { city: 'Kavajë', country: 'Albania', latitude: 41.1844, longitude: 19.5569, weight: 80, hasZones: false },
    ];

    for (const loc of locations) {
        await prisma.location.upsert({
            where: { city_country: { city: loc.city, country: loc.country } },
            update: {},
            create: loc,
        });
    }

    console.log('  ✅ Categories, locations, and admin user seeded\n');

    // Step 2: Seed posts
    console.log('📦 Step 2: Seeding posts...');
    const samplePosts = [
        { title: 'iPhone 13 Pro Max 256GB', description: 'Në gjendje të shkëlqyer, vetëm 6 muaj përdorim. Bateria 98%. Me kutinë origjinale dhe aksesorë.', price: 85000, categorySlug: 'celulare' },
        { title: 'Samsung Galaxy S23 Ultra', description: 'I ri, i pah me kufizë, me garancion 2 vjet. 512GB memorie, ngjyrë e zezë.', price: 120000, categorySlug: 'celulare' },
        { title: 'MacBook Pro 14" M2', description: 'MacBook Pro 2023, 16GB RAM, 512GB SSD. Përdorur vetëm për punë, pa asnjë gërvishtje.', price: 180000, categorySlug: 'laptop-pc' },
        { title: 'Canon EOS R6 Camera', description: 'Aparat fotografik profesional, me objektiv 24-70mm. Shutter count 5000.', price: 220000, categorySlug: 'kamera' },
        { title: 'AirPods Pro 2', description: 'Të reja, të papërdorura, me faturë. USB-C version.', price: 25000, categorySlug: 'audio-tv' },
        { title: 'Mercedes C200 2020', description: 'Mercedes-Benz C200, viti 2020, 45,000 km, ngjyrë e bardhë. Servisi i plotë.', price: 3200000, categorySlug: 'makina' },
        { title: 'Honda CBR 600RR 2019', description: 'Motoçikletë sportive, 15,000 km, asnjë aksidentë, gjendje perfekte.', price: 650000, categorySlug: 'motocikleta' },
        { title: 'Apartament 1+1 Blloku', description: 'Apartament modern 1+1 në Blloku, 55m2, mobiluar, kati 4. 350€/muaj.', price: 350, categorySlug: 'apartamente-qira' },
        { title: 'Kollltuk L-Shape', description: 'Kollltuk modern L-shape, ngjyrë gri, pëlhurë, 3.5m gjatësi.', price: 45000, categorySlug: 'mobilje' },
        { title: 'Pallto The North Face', description: 'Pallto dimri The North Face, Size M, e zezë, origjinale, e përdorur 1 sezon.', price: 12000, categorySlug: 'mode' },
        { title: 'Biçikletë Malore', description: 'Biçikletë MTB Giant, 29", Shimano Deore, amortizatorë ajri.', price: 65000, categorySlug: 'sport-hobi' },
    ];

    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@marketplace.com' },
    });

    if (!adminUser) {
        throw new Error('Admin user not found');
    }

    const allLocations = await prisma.location.findMany({
        orderBy: { weight: 'desc' },
    });

    const categoriesMap = new Map<string, string>();
    const allCategories = await prisma.category.findMany();
    for (const cat of allCategories) {
        categoriesMap.set(cat.slug, cat.id);
    }

    let postCount = 0;
    const totalPosts = 100;

    while (postCount < totalPosts) {
        for (const post of samplePosts) {
            if (postCount >= totalPosts) break;

            const categoryId = categoriesMap.get(post.categorySlug);
            if (!categoryId) {
                console.warn(`Category slug "${post.categorySlug}" not found, skipping post: ${post.title}`);
                continue;
            }

            const location = allLocations[postCount % allLocations.length];
            const priceVariation = 1 + (Math.random() * 0.3 - 0.15);
            const variation = postCount > 0 ? ` (${Math.floor(postCount / samplePosts.length) + 1})` : '';

            await prisma.post.create({
                data: {
                    title: `${post.title}${variation}`,
                    description: post.description,
                    price: Math.round(post.price * priceVariation),
                    categoryId: categoryId,
                    locationId: location.id,
                    userId: adminUser.id,
                    images: [`https://picsum.photos/600/400?random=${postCount}`],
                    status: 'ACTIVE',
                },
            });

            postCount++;
            if (postCount % 20 === 0) {
                console.log(`  Created ${postCount}/${totalPosts} posts...`);
            }
        }
    }
    console.log(`  ✅ Seeded ${postCount} posts\n`);

    // Step 3: Seed ads
    console.log('📢 Step 3: Seeding ads...');
    const sampleAds = [
        {
            title: 'Special Offer - Electronics Sale',
            image: 'https://picsum.photos/600/400?random=ad1',
            link: 'https://example.com/electronics-sale',
            position: 0,
            active: true,
        },
        {
            title: 'New Arrivals - Fashion Collection',
            image: 'https://picsum.photos/600/400?random=ad2',
            link: 'https://example.com/fashion',
            position: 20,
            active: true,
        },
        {
            title: 'Premium Properties Available',
            image: 'https://picsum.photos/600/400?random=ad3',
            link: 'https://example.com/properties',
            position: 40,
            active: true,
        },
        {
            title: 'Vehicle Financing Options',
            image: 'https://picsum.photos/600/400?random=ad4',
            link: 'https://example.com/vehicles',
            position: 60,
            active: true,
        },
        {
            title: 'Home & Garden Essentials',
            image: 'https://picsum.photos/600/400?random=ad5',
            link: 'https://example.com/home-garden',
            position: 80,
            active: true,
        },
    ];

    for (const ad of sampleAds) {
        await prisma.ad.create({ data: ad });
    }

    console.log(`  ✅ Seeded ${sampleAds.length} ads\n`);

    console.log('🎉 Full database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
