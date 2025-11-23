"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const samplePosts = [
    { title: 'iPhone 13 Pro Max 256GB', description: 'Në gjendje të shkëlqyer, vetëm 6 muaj përdorim. Bateria 98%. Me kutinë origjinale dhe aksesorë.', price: 85000, categorySlug: 'celulare' },
    { title: 'Samsung Galaxy S23 Ultra', description: 'I ri, i pah me kufizë, me garancion 2 vjet. 512GB memorie, ngjyrë e zezë.', price: 120000, categorySlug: 'celulare' },
    { title: 'iPhone 15 Pro 128GB', description: 'I ri, me faturë, ngjyrë natyrore titan. Përdorur vetëm 2 muaj.', price: 95000, categorySlug: 'celulare' },
    { title: 'Xiaomi 13 Pro', description: 'Flagship Xiaomi, 256GB, Leica kamera, gjendje perfekte.', price: 70000, categorySlug: 'celulare' },
    { title: 'OnePlus 11', description: 'OnePlus 11, 256GB, ngjyrë e gjelbër, gjendje e shkëlqyer.', price: 65000, categorySlug: 'celulare' },
    { title: 'MacBook Pro 14" M2', description: 'MacBook Pro 2023, 16GB RAM, 512GB SSD. Përdorur vetëm për punë, pa asnjë gërvishtje.', price: 180000, categorySlug: 'laptop-pc' },
    { title: 'Dell XPS 15 Laptop', description: 'I5 11th Gen, 16GB RAM, 512 SSD, ekran 4K. Gjendje perfekte.', price: 75000, categorySlug: 'laptop-pc' },
    { title: 'Lenovo ThinkPad X1 Carbon', description: 'ThinkPad X1 Carbon Gen 10, i7, 16GB, 512GB SSD. Përdorur për biznes.', price: 85000, categorySlug: 'laptop-pc' },
    { title: 'HP Spectre x360', description: 'HP Spectre x360 2-in-1, i7, 16GB, 1TB SSD, touchscreen.', price: 90000, categorySlug: 'laptop-pc' },
    { title: 'ASUS ROG Strix Gaming', description: 'Gaming laptop, RTX 4060, i7 13th Gen, 16GB RAM, 512GB SSD.', price: 120000, categorySlug: 'laptop-pc' },
    { title: 'Canon EOS R6 Camera', description: 'Aparat fotografik profesional, me objektiv 24-70mm. Shutter count 5000.', price: 220000, categorySlug: 'kamera' },
    { title: 'DJI Mini 3 Pro Drone', description: 'Dron me kamerë 4K, bateria të reja, me çantë transporti.', price: 85000, categorySlug: 'kamera' },
    { title: 'Sony A7III Mirrorless', description: 'Sony Alpha 7 III, me objektiv 28-70mm, gjendje perfekte.', price: 180000, categorySlug: 'kamera' },
    { title: 'Nikon D850 DSLR', description: 'Nikon D850, 45MP, me objektiv 24-120mm, profesionale.', price: 250000, categorySlug: 'kamera' },
    { title: 'GoPro Hero 12', description: 'GoPro Hero 12 Black, me aksesorë, përdorur 3 herë.', price: 35000, categorySlug: 'kamera' },
    { title: 'AirPods Pro 2', description: 'Të reja, të papërdorura, me faturë. USB-C version.', price: 25000, categorySlug: 'audio-tv' },
    { title: 'Samsung 55" 4K Smart TV', description: 'Televizor Samsung QLED, 55 inch, 4K, HDR. Si i ri.', price: 60000, categorySlug: 'audio-tv' },
    { title: 'Sony WH-1000XM5 Headphones', description: 'Kufje me zhurmë anuluese, gjendje perfekte, me kutinë.', price: 45000, categorySlug: 'audio-tv' },
    { title: 'LG 65" OLED TV', description: 'LG OLED 65 inch, 4K, HDR, Smart TV, gjendje e shkëlqyer.', price: 120000, categorySlug: 'audio-tv' },
    { title: 'Sonos Beam Soundbar', description: 'Soundbar Sonos Beam, me subwoofer, audio cilësi lartë.', price: 55000, categorySlug: 'audio-tv' },
    { title: 'Mercedes C200 2020', description: 'Mercedes-Benz C200, viti 2020, 45,000 km, ngjyrë e bardhë. Servisi i plotë.', price: 3200000, categorySlug: 'makina' },
    { title: 'BMW X5 2019', description: 'BMW X5 xDrive, viti 2019, 60,000 km, full options, panoramik.', price: 4500000, categorySlug: 'makina' },
    { title: 'Volkswagen Golf 7 GTI', description: 'Golf 7 GTI 2016, 80,000 km, manual, I kuq, në gjendje perfekte.', price: 1800000, categorySlug: 'makina' },
    { title: 'Audi A4 2018', description: 'Audi A4 Avant Quattro, dizell, automatik, gjendje e shkëlqyer.', price: 2900000, categorySlug: 'makina' },
    { title: 'Toyota Yaris Hybrid 2021', description: 'Yaris Hybrid, ekonomike, 30,000 km, garanci deri në 2026.', price: 1900000, categorySlug: 'makina' },
    { title: 'Fiat 500 Electric 2022', description: 'Fiat 500e elektrike, 20,000 km, e kuqe, karikimi i shpejtë.', price: 2200000, categorySlug: 'makina' },
    { title: 'Range Rover Evoque 2020', description: 'Range Rover Evoque Dynamic, 40,000 km, e zezë, full ekstra.', price: 4000000, categorySlug: 'makina' },
    { title: 'Hyundai Tucson 2021', description: 'Hyundai Tucson, 35,000 km, automatik, full options, gjendje perfekte.', price: 2400000, categorySlug: 'makina' },
    { title: 'Honda CBR 600RR 2019', description: 'Motoçikletë sportive, 15,000 km, asnjë aksidentë, gjendje perfekte.', price: 650000, categorySlug: 'motocikleta' },
    { title: 'Yamaha MT-07 2020', description: 'Yamaha MT-07, 20,000 km, e zezë, gjendje e shkëlqyer.', price: 550000, categorySlug: 'motocikleta' },
    { title: 'Ducati Monster 821', description: 'Ducati Monster 821, 12,000 km, e kuqe, gjendje perfekte.', price: 850000, categorySlug: 'motocikleta' },
    { title: 'Apartament 1+1 Blloku', description: 'Apartament modern 1+1 në Blloku, 55m2, mobiluar, kati 4. 350€/muaj.', price: 350, categorySlug: 'apartamente-qira' },
    { title: 'Studio në Qendër', description: 'Studio 35m2 pranë Skanderbeg, i mobiluar, me ashensor. 300€/muaj.', price: 300, categorySlug: 'apartamente-qira' },
    { title: 'Apartament 2+1 Kombinat', description: '2+1, 85m2, kati 2, i rinovuar, me parkim. 400€/muaj.', price: 400, categorySlug: 'apartamente-qira' },
    { title: 'Vilë 3+1 Selitë', description: 'Vilë me oborr, 200m2 + 100m2 oborr, mobiluar pjesërisht. 800€/muaj.', price: 800, categorySlug: 'apartamente-qira' },
    { title: 'Apartament 2+1 Lapraka', description: '2+1, 90m2, kati 3, i mobiluar, me ballkon. 450€/muaj.', price: 450, categorySlug: 'apartamente-qira' },
    { title: 'Apartament 3+1 Blloku', description: 'Apartament 3+1, 120m2, kati 5, panoramik, i rinovuar. 85,000€.', price: 85000, categorySlug: 'apartamente-shitje' },
    { title: 'Vilë 4+1 Dajti', description: 'Vilë me oborr, 250m2, 3 kate, me garazh. 180,000€.', price: 180000, categorySlug: 'apartamente-shitje' },
    { title: 'Apartament 2+1 Qendër', description: '2+1, 95m2, kati 2, pranë Skanderbeg, i mobiluar. 75,000€.', price: 75000, categorySlug: 'apartamente-shitje' },
    { title: 'Kollltuk L-Shape', description: 'Kollltuk modern L-shape, ngjyrë gri, pëlhurë, 3.5m gjatësi.', price: 45000, categorySlug: 'mobilje' },
    { title: 'Tavolinë Ngrënie me 6 karrige', description: 'Tavolinë druri me 6 karrige, stil modern, gjendje e shkëlqyer.', price: 35000, categorySlug: 'mobilje' },
    { title: 'Krevat 160x200 me dyshek', description: 'Krevat matrimonial me kornizë lëkure dhe dyshek ortopedik.', price: 55000, categorySlug: 'mobilje' },
    { title: 'Raft Librash IKEA', description: 'Raft librash IKEA Billy, i bardhë, 200cm lartësi, gjendje perfekte.', price: 8000, categorySlug: 'mobilje' },
    { title: 'Pasqyrë e Madhe Muri', description: 'Pasqyrë dekorative për mur, 180x80cm, me kornizë ari.', price: 12000, categorySlug: 'mobilje' },
    { title: 'Komodë 3 Drawers', description: 'Komodë moderne me 3 sirtarë, ngjyrë e bardhë, IKEA.', price: 15000, categorySlug: 'mobilje' },
    { title: 'Lavatriçe Samsung 9kg', description: 'Lavatriçe Samsung, 9kg, inverter, klasë energjie A+++.', price: 45000, categorySlug: 'elektroshtepiake' },
    { title: 'Frigorifer Bosch Kombi', description: 'Frigorifer Bosch, 350L, No Frost, klasë energjie A+++.', price: 55000, categorySlug: 'elektroshtepiake' },
    { title: 'Pështjellës Bosch', description: 'Pështjellës Bosch, 60cm, me programe të shumta, gjendje perfekte.', price: 35000, categorySlug: 'elektroshtepiake' },
    { title: 'Mikrovalë Samsung', description: 'Mikrovalë Samsung, 25L, me grill, gjendje e shkëlqyer.', price: 12000, categorySlug: 'elektroshtepiake' },
    { title: 'Pallto The North Face', description: 'Pallto dimri The North Face, Size M, e zezë, origjinale, e përdorur 1 sezon.', price: 12000, categorySlug: 'mode' },
    { title: 'Nike Air Max 97', description: 'Këpucë Nike Air Max 97, numër 42, të reja, me etiketë.', price: 15000, categorySlug: 'mode' },
    { title: 'Çantë Louis Vuitton', description: 'Çantë dore Louis Vuitton Neverfull, origjinale, me faturë dhe kartë.', price: 90000, categorySlug: 'mode' },
    { title: 'Xhins Levi\'s 501', description: 'Xhins Levi\'s 501 original, size 32, ngjyrë blu, si të rinj.', price: 4000, categorySlug: 'mode' },
    { title: 'Bluzë Tommy Hilfiger', description: 'Bluzë me mëngë të gjata Tommy Hilfiger, size L, e kuqe.', price: 3500, categorySlug: 'mode' },
    { title: 'Çizme UGG', description: 'Çizme UGG origjinale, size 38, ngjyrë kafe, të reja.', price: 18000, categorySlug: 'mode' },
    { title: 'Biçikletë Malore', description: 'Biçikletë MTB Giant, 29", Shimano Deore, amortizatorë ajri.', price: 65000, categorySlug: 'sport-hobi' },
    { title: 'Peshore Celësi Conditrainer', description: 'Set peshash profesionale 5-30kg me stendë, gjendje e shkëlqyer.', price: 35000, categorySlug: 'sport-hobi' },
    { title: 'Pajisje Palestër Shtëpiake', description: 'Makinë eliptike për shtëpi, folding, ekran LCD. Si e re.', price: 25000, categorySlug: 'sport-hobi' },
    { title: 'Tenda Kamping 4 Persona', description: 'Tenda Coleman, 4 persona, e përdorur 2 herë, me çantë.', price: 15000, categorySlug: 'sport-hobi' },
    { title: 'Tabla Surf', description: 'Surfboard 7\'6", modern, për fillestarë dhe të avancuar.', price: 28000, categorySlug: 'sport-hobi' },
    { title: 'PlayStation 5', description: 'PS5 Disk Edition me 2 kontrollerë dhe 3 lojëra. Përdorur 1 vit.', price: 45000, categorySlug: 'sport-hobi' },
    { title: 'Xbox Series X', description: 'Xbox Series X me 2 kontrollerë dhe Game Pass 3 muaj. Si i ri.', price: 50000, categorySlug: 'sport-hobi' },
];
async function main() {
    console.log('Starting posts seed...');
    console.log('Truncating posts...');
    await prisma.post.deleteMany({});
    console.log('Posts truncated');
    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@marketplace.com' },
    });
    if (!adminUser) {
        throw new Error('Admin user not found. Please run seed.sql first.');
    }
    const locations = await prisma.location.findMany({
        orderBy: { weight: 'desc' },
    });
    if (locations.length === 0) {
        throw new Error('No locations found. Please run seed.sql first.');
    }
    const categoriesMap = new Map();
    const allCategories = await prisma.category.findMany();
    for (const cat of allCategories) {
        categoriesMap.set(cat.slug, cat.id);
    }
    let postCount = 0;
    const totalPosts = 100;
    while (postCount < totalPosts) {
        for (const post of samplePosts) {
            if (postCount >= totalPosts)
                break;
            const categoryId = categoriesMap.get(post.categorySlug);
            if (!categoryId) {
                console.warn(`Category slug "${post.categorySlug}" not found, skipping post: ${post.title}`);
                continue;
            }
            const location = locations[postCount % locations.length];
            const priceVariation = 1 + (Math.random() * 0.3 - 0.15);
            const variation = postCount > 0 ? ` (${Math.floor(postCount / samplePosts.length) + 1})` : '';
            const createdPost = await prisma.post.create({
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
            if (postCount % 10 === 0) {
                console.log(`Created ${postCount}/${totalPosts} posts...`);
            }
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
//# sourceMappingURL=seed-posts.js.map