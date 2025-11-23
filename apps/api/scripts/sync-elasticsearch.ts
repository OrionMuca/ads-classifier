import { PrismaClient } from '@prisma/client';
import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const esClient = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

const indexName = 'marketplace_posts_v2';

async function main() {
    console.log('🔄 Syncing Elasticsearch with database...\n');

    try {
        // Check Elasticsearch connection
        await esClient.ping();
        console.log('✅ Connected to Elasticsearch\n');

        // Get all posts from database
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

        // Check if index exists
        const indexExists = await esClient.indices.exists({ index: indexName });
        
        // Get current Elasticsearch document count
        let esDocCount = 0;
        if (indexExists) {
            try {
                const esStats = await esClient.indices.stats({ index: indexName });
                esDocCount = esStats.indices?.[indexName]?.total?.docs?.count || 0;
            } catch (error) {
                // Index might not have stats yet
                esDocCount = 0;
            }
        }
        console.log(`📊 Current Elasticsearch documents: ${esDocCount}`);

        // Delete all documents if index exists (to remove stale data)
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
            } catch (error: any) {
                console.log('⚠️  Could not clear old documents:', error.message);
                console.log('   Continuing with indexing...\n');
            }
        } else {
            console.log('📇 Index does not exist or is empty\n');
        }

        // Index all posts
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
            } catch (error: any) {
                errorCount++;
                console.error(`   ❌ Error indexing post ${post.id}:`, error.message);
            }
        }

        // Refresh index to make documents searchable
        await esClient.indices.refresh({ index: indexName });

        console.log(`\n✅ Sync completed!`);
        console.log(`   ✅ Successfully indexed: ${indexedCount} posts`);
        if (errorCount > 0) {
            console.log(`   ❌ Errors: ${errorCount} posts`);
        }

        // Verify sync
        let finalDocCount = 0;
        try {
            const finalStats = await esClient.indices.stats({ index: indexName });
            finalDocCount = finalStats.indices?.[indexName]?.total?.docs?.count || 0;
        } catch (error) {
            console.log('⚠️  Could not get final stats');
        }
        console.log(`\n📊 Final Elasticsearch document count: ${finalDocCount}`);
        console.log(`📊 Database post count: ${posts.length}`);

        if (finalDocCount === posts.length) {
            console.log('✅ Sync verified: Counts match!');
        } else {
            console.log('⚠️  Warning: Counts do not match. Some posts may not be indexed.');
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Make sure Elasticsearch is running:');
            console.error('   docker-compose up elasticsearch');
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await esClient.close();
    }
}

main();

