"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv = require("dotenv");
const path_1 = require("path");
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
const prisma = new client_1.PrismaClient();
const esClient = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});
const indexName = 'marketplace_posts_v2';
async function main() {
    console.log('🔄 Syncing Elasticsearch with database...\n');
    try {
        await esClient.ping();
        console.log('✅ Connected to Elasticsearch\n');
        const posts = await prisma.post.findMany({
            include: {
                category: true,
                location: true,
                zone: true,
            },
        });
        console.log(`📊 Found ${posts.length} posts in database\n`);
        if (posts.length === 0) {
            console.log('⚠️  No posts found in database. Run: npm run seed');
            return;
        }
        const indexExists = await esClient.indices.exists({ index: indexName });
        let esDocCount = 0;
        if (indexExists) {
            try {
                const esStats = await esClient.indices.stats({ index: indexName });
                esDocCount = esStats.indices?.[indexName]?.total?.docs?.count || 0;
            }
            catch (error) {
                esDocCount = 0;
            }
        }
        console.log(`📊 Current Elasticsearch documents: ${esDocCount}`);
        if (indexExists && esDocCount > 0) {
            console.log('🗑️  Clearing old documents from Elasticsearch...');
            try {
                await esClient.deleteByQuery({
                    index: indexName,
                    body: {
                        query: { match_all: {} },
                    },
                });
                console.log('✅ Old documents cleared\n');
            }
            catch (error) {
                console.log('⚠️  Could not clear old documents:', error.message);
                console.log('   Continuing with indexing...\n');
            }
        }
        else {
            console.log('📇 Index does not exist or is empty\n');
        }
        let indexedCount = 0;
        let errorCount = 0;
        console.log('📝 Indexing posts...\n');
        for (const post of posts) {
            try {
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
                        images: post.images || [],
                        userId: post.userId,
                        createdAt: post.createdAt,
                        updatedAt: post.updatedAt,
                    },
                });
                indexedCount++;
                if (indexedCount % 20 === 0) {
                    console.log(`   Indexed ${indexedCount}/${posts.length} posts...`);
                }
            }
            catch (error) {
                errorCount++;
                console.error(`   ❌ Error indexing post ${post.id}:`, error.message);
            }
        }
        await esClient.indices.refresh({ index: indexName });
        console.log(`\n✅ Sync completed!`);
        console.log(`   ✅ Successfully indexed: ${indexedCount} posts`);
        if (errorCount > 0) {
            console.log(`   ❌ Errors: ${errorCount} posts`);
        }
        let finalDocCount = 0;
        try {
            const finalStats = await esClient.indices.stats({ index: indexName });
            finalDocCount = finalStats.indices?.[indexName]?.total?.docs?.count || 0;
        }
        catch (error) {
            console.log('⚠️  Could not get final stats');
        }
        console.log(`\n📊 Final Elasticsearch document count: ${finalDocCount}`);
        console.log(`📊 Database post count: ${posts.length}`);
        if (finalDocCount === posts.length) {
            console.log('✅ Sync verified: Counts match!');
        }
        else {
            console.log('⚠️  Warning: Counts do not match. Some posts may not be indexed.');
        }
    }
    catch (error) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Make sure Elasticsearch is running:');
            console.error('   docker-compose up elasticsearch');
        }
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
        await esClient.close();
    }
}
main();
//# sourceMappingURL=sync-elasticsearch.js.map