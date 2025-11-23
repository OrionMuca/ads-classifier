"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
async function main() {
    console.log('Starting ads seed...');
    console.log('Truncating ads...');
    await prisma.ad.deleteMany({});
    console.log('Ads truncated');
    for (const ad of sampleAds) {
        const createdAd = await prisma.ad.create({
            data: ad,
        });
        console.log(`Created ad: ${createdAd.title} (position: ${createdAd.position})`);
    }
    console.log(`✅ Seeded ${sampleAds.length} ads successfully`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed-ads.js.map