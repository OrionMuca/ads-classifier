"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const elasticsearch_1 = require("@elastic/elasticsearch");
const prisma = new client_1.PrismaClient();
const esClient = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});
const indexName = 'marketplace_posts_v2';
async function main() {
    console.log('Starting reindex...');
    const exists = await esClient.indices.exists({ index: indexName });
    if (!exists) {
        console.log('Creating index...');
        await esClient.indices.create({
            index: indexName,
            mappings: {
                properties: {
                    id: { type: 'keyword' },
                    title: { type: 'text' },
                    description: { type: 'text' },
                    price: { type: 'float' },
                    status: { type: 'keyword' },
                    viewCount: { type: 'integer' },
                    categoryId: { type: 'keyword' },
                    categoryName: { type: 'text' },
                    categorySlug: { type: 'keyword' },
                    locationId: { type: 'keyword' },
                    city: { type: 'keyword' },
                    country: { type: 'keyword' },
                    images: { type: 'keyword' },
                    userId: { type: 'keyword' },
                    createdAt: { type: 'date' },
                    updatedAt: { type: 'date' },
                },
            },
        });
    }
    const posts = await prisma.post.findMany({
        include: {
            category: true,
            location: true,
            zone: true,
        },
    });
    console.log(`Found ${posts.length} posts to index.`);
    let indexedCount = 0;
    for (const post of posts) {
        await esClient.index({
            index: indexName,
            id: post.id,
            document: {
                id: post.id,
                title: post.title,
                description: post.description,
                price: parseFloat(post.price.toString()),
                status: post.status || 'ACTIVE',
                viewCount: post.viewCount || 0,
                categoryId: post.categoryId || post.category?.id,
                categoryName: post.category?.name,
                categorySlug: post.category?.slug,
                locationId: post.locationId || post.location?.id,
                city: post.location?.city,
                country: post.location?.country || 'Albania',
                zoneId: post.zoneId || post.zone?.id,
                zoneName: post.zone?.name,
                images: post.images,
                userId: post.userId,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            },
        });
        indexedCount++;
        if (indexedCount % 10 === 0) {
            console.log(`Indexed ${indexedCount} posts...`);
        }
    }
    console.log(`✅ Successfully indexed ${indexedCount} posts.`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reindex.js.map