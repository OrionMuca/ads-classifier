import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
    { id: 'cat-1', name: 'Elektronikë', slug: 'elektronike', icon: '📱' },
    { id: 'cat-2', name: 'Automjete', slug: 'automjete', icon: '🚗' },
    { id: 'cat-3', name: 'Prona për Qira', slug: 'prona-qira', icon: '🏠' },
    { id: 'cat-4', name: 'Veshje', slug: 'veshje', icon: '👕' },
    { id: 'cat-11', name: 'Pajisje Shtëpiake', slug: 'pajisje-shtepiake', icon: '🛋️' },
    { id: 'cat-17', name: 'Artikuj Sportivi', slug: 'artikuj-sportivi', icon: '⚽' },
];

const locations = [
    { id: 'l0000000-0000-0000-0000-000000000001', city: 'Tiranë' },
    { id: 'l0000000-0000-0000-0000-000000000002', city: 'Durrës' },
    { id: 'l0000000-0000-0000-0000-000000000003', city: 'Vlorë' },
    { id: 'l0000000-0000-0000-0000-000000000004', city: 'Shkodër' },
    { id: 'l0000000-0000-0000-0000-000000000005', city: 'Elbasan' },
];

const samplePosts = [
    // Electronics (Main: c...1)
    { title: 'iPhone 13 Pro Max 256GB', description: 'Në gjendje të shkëlqyer, vetëm 6 muaj përdorim. Bateria 98%. Me kutinë origjinale dhe aksesorë.', price: 85000, categoryId: 'c1000000-0000-0000-0000-000000000001' }, // Celularë
    { title: 'Samsung Galaxy S23 Ultra', description: 'I ri, i pah me kufizë, me garancion 2 vjet. 512GB memorie, ngjyrë e zezë.', price: 120000, categoryId: 'c1000000-0000-0000-0000-000000000001' },
    { title: 'MacBook Pro 14" M2', description: 'MacBook Pro 2023, 16GB RAM, 512GB SSD. Përdorur vetëm për punë, pa asnjë gërvishtje.', price: 180000, categoryId: 'c1000000-0000-0000-0000-000000000002' }, // Laptopë
    { title: 'Dell XPS 15 Laptop', description: 'I5 11th Gen, 16GB RAM, 512 SSD, ekran 4K. Gjendje perfekte.', price: 75000, categoryId: 'c1000000-0000-0000-0000-000000000002' },
    { title: 'iPad Air 5th Gen', description: '64GB, Rose Gold, me Apple Pencil 2. 10 muaj përdorim, sikur i ri.', price: 55000, categoryId: 'c1000000-0000-0000-0000-000000000001' },
    { title: 'AirPods Pro 2', description: 'Të reja, të papërdorura, me faturë. USB-C version.', price: 25000, categoryId: 'c1000000-0000-0000-0000-000000000004' }, // Audio
    { title: 'PlayStation 5', description: 'PS5 Disk Edition me 2 kontrollerë dhe 3 lojëra. Përdorur 1 vit.', price: 45000, categoryId: 'c0000000-0000-0000-0000-000000000006' }, // Sport & Hobi (Gaming usually here or electronics) -> Using Sport & Hobi for now or Main Electronics
    { title: 'Samsung 55" 4K Smart TV', description: 'Televizor Samsung QLED, 55 inch, 4K, HDR. Si i ri.', price: 60000, categoryId: 'c1000000-0000-0000-0000-000000000004' }, // Audio & TV
    { title: 'Canon EOS R6 Camera', description: 'Aparat fotografik profesional, me objektiv 24-70mm. Shutter count 5000.', price: 220000, categoryId: 'c1000000-0000-0000-0000-000000000003' }, // Kamera
    { title: 'DJI Mini 3 Pro Drone', description: 'Dron me kamerë 4K, bateria të reja, me çantë transporti.', price: 85000, categoryId: 'c1000000-0000-0000-0000-000000000003' },

    // Vehicles (Main: c...2)
    { title: 'Mercedes C200 2020', description: 'Mercedes-Benz C200, viti 2020, 45,000 km, ngjyrë e bardhë. Servisi i plotë.', price: 3200000, categoryId: 'c2000000-0000-0000-0000-000000000001' }, // Makina
    { title: 'BMW X5 2019', description: 'BMW X5 xDrive, viti 2019, 60,000 km, full options, panoramik.', price: 4500000, categoryId: 'c2000000-0000-0000-0000-000000000001' },
    { title: 'Volkswagen Golf 7 GTI', description: 'Golf 7 GTI 2016, 80,000 km, manual, I kuq, në gjendje perfekte.', price: 1800000, categoryId: 'c2000000-0000-0000-0000-000000000001' },
    { title: 'Audi A4 2018', description: 'Audi A4 Avant Quattro, dizell, automatik, gjendje e shkëlqyer.', price: 2900000, categoryId: 'c2000000-0000-0000-0000-000000000001' },
    { title: 'Toyota Yaris Hybrid 2021', description: 'Yaris Hybrid, ekonomike, 30,000 km, garanci deri në 2026.', price: 1900000, categoryId: 'c2000000-0000-0000-0000-000000000001' },
    { title: 'Honda CBR 600RR 2019', description: 'Motoçikletë sportive, 15,000 km, asnjë aksidentë, gjendje perfekte.', price: 650000, categoryId: 'c2000000-0000-0000-0000-000000000002' }, // Motocikleta
    { title: 'Fiat 500 Electric 2022', description: 'Fiat 500e elektrike, 20,000 km, e kuqe, karikimi i shpejtë.', price: 2200000, categoryId: 'c2000000-0000-0000-0000-000000000001' },
    { title: 'Range Rover Evoque 2020', description: 'Range Rover Evoque Dynamic, 40,000 km, e zezë, full ekstra.', price: 4000000, categoryId: 'c2000000-0000-0000-0000-000000000001' },

    // Properties (Main: c...3)
    { title: 'Apartament 1+1 Blloku', description: 'Apartament modern 1+1 në Blloku, 55m2, mobiluar, kati 4. 350€/muaj.', price: 350, categoryId: 'c3000000-0000-0000-0000-000000000002' }, // Apartamente me Qira
    { title: 'Studio në Qendër', description: 'Studio 35m2 pranë Skanderbeg, i mobiluar, me ashensor. 300€/muaj.', price: 300, categoryId: 'c3000000-0000-0000-0000-000000000002' },
    { title: 'Apartament 2+1 Kombinat', description: '2+1, 85m2, kati 2, i rinovuar, me parkim. 400€/muaj.', price: 400, categoryId: 'c3000000-0000-0000-0000-000000000002' },
    { title: 'Vilë 3+1 Selitë', description: 'Vilë me oborr, 200m2 + 100m2 oborr, mobiluar pjesërisht. 800€/muaj.', price: 800, categoryId: 'c3000000-0000-0000-0000-000000000002' },
    { title: 'Dyqan 50m2 Myslym Shyri', description: 'Hapësirë komerciale 50m2, me vitrinë, i mirë për çdo biznes. 600€/muaj.', price: 600, categoryId: 'c3000000-0000-0000-0000-000000000002' },

    // Clothing & Fashion (Main: c...5)
    { title: 'Pallto The North Face', description: 'Pallto dimri The North Face, Size M, e zezë, origjinale, e përdorur 1 sezon.', price: 12000, categoryId: 'c0000000-0000-0000-0000-000000000005' },
    { title: 'Nike Air Max 97', description: 'Këpucë Nike Air Max 97, numër 42, të reja, me etiketë.', price: 15000, categoryId: 'c0000000-0000-0000-0000-000000000005' },
    { title: 'Çantë Louis Vuitton', description: 'Çantë dore Louis Vuitton Neverfull, origjinale, me faturë dhe kartë.', price: 90000, categoryId: 'c0000000-0000-0000-0000-000000000005' },
    { title: 'Xhins Levi\'s 501', description: 'Xhins Levi\'s 501 original, size 32, ngjyrë blu, si të rinj.', price: 4000, categoryId: 'c0000000-0000-0000-0000-000000000005' },
    { title: 'Bluzë Tommy Hilfiger', description: 'Bluzë me mëngë të gjata Tommy Hilfiger, size L, e kuqe.', price: 3500, categoryId: 'c0000000-0000-0000-0000-000000000005' },

    // Home & Furniture (Main: c...4)
    { title: 'Kollltuk L-Shape', description: 'Kollltuk modern L-shape, ngjyrë gri, pëlhurë, 3.5m gjatësi.', price: 45000, categoryId: 'c4000000-0000-0000-0000-000000000001' }, // Mobilje
    { title: 'Tavolinë Ngrënie me 6 karrige', description: 'Tavolinë druri me 6 karrige, stil modern, gjendje e shkëlqyer.', price: 35000, categoryId: 'c4000000-0000-0000-0000-000000000001' },
    { title: 'Krevat 160x200 me dyshek', description: 'Krevat matrimonial me kornizë lëkure dhe dyshek ortopedik.', price: 55000, categoryId: 'c4000000-0000-0000-0000-000000000001' },
    { title: 'Raft Librash IKEA', description: 'Raft librash IKEA Billy, i bardhë, 200cm lartësi, gjendje perfekte.', price: 8000, categoryId: 'c4000000-0000-0000-0000-000000000001' },
    { title: 'Pasqyrë e Madhe Muri', description: 'Pasqyrë dekorative për mur, 180x80cm, me kornizë ari.', price: 12000, categoryId: 'c4000000-0000-0000-0000-000000000001' },

    // Sports (Main: c...6)
    { title: 'Biçikletë Malore', description: 'Biçikletë MTB Giant, 29", Shimano Deore, amortizatorë ajri.', price: 65000, categoryId: 'c0000000-0000-0000-0000-000000000006' },
    { title: 'Peshore Celësi Conditrainer', description: 'Set peshash profesionale 5-30kg me stendë, gjendje e shkëlqyer.', price: 35000, categoryId: 'c0000000-0000-0000-0000-000000000006' },
    { title: 'Pajisje Palestër Shtëpiake', description: 'Makinë eliptike për shtëpi, folding, ekran LCD. Si e re.', price: 25000, categoryId: 'c0000000-0000-0000-0000-000000000006' },
    { title: 'Tenda Kamping 4 Persona', description: 'Tenda Coleman, 4 persona, e përdorur 2 herë, me çantë.', price: 15000, categoryId: 'c0000000-0000-0000-0000-000000000006' },
    { title: 'Tabla Surf', description: 'Surfboard 7\'6", modern, për fillestarë dhe të avancuar.', price: 28000, categoryId: 'c0000000-0000-0000-0000-000000000006' },
];

import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log('Starting seed...');

    // Execute seed.sql first
    const sqlPath = path.join(__dirname, 'seed.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    console.log('Executing seed.sql...');

    // Split by semicolon to execute statements individually
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const statement of statements) {
        try {
            await prisma.$executeRawUnsafe(statement);
        } catch (error) {
            console.error('Error executing statement:', statement);
            throw error;
        }
    }
    console.log('seed.sql executed successfully');

    // Create a test user (if not exists - admin is created by seed.sql)
    const hashedPassword = '$2b$10$YourHashedPasswordHere'; // In real scenario, hash properly

    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            password: hashedPassword,
            name: 'Test User',
            phone: '+355692345678',
            role: 'USER',
        },
    });

    console.log(`Created user: ${user.email}`);

    // Create 100 posts by repeating and varying
    let postCount = 0;

    for (let i = 0; i < 3; i++) { // Repeat 3 times = ~120 posts
        for (const post of samplePosts) {
            if (postCount >= 100) break;

            const locationId = locations[postCount % locations.length].id;
            const priceVariation = 1 + (Math.random() * 0.3 - 0.15); // ±15% variation

            const createdPost = await prisma.post.create({
                data: {
                    title: `${post.title}${i > 0 ? ` (${i + 1})` : ''}`,
                    description: post.description,
                    price: Math.round(post.price * priceVariation),
                    categoryId: post.categoryId,
                    locationId: locationId,
                    userId: user.id,
                    images: ['https://picsum.photos/600/400?' + Math.random()],
                    status: 'ACTIVE',
                },
                include: {
                    category: true,
                    location: true,
                },
            });

            postCount++;
            console.log(`Created post ${postCount}: ${createdPost.title}`);
        }
    }

    console.log(`✅ Seeded ${postCount} posts successfully`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
