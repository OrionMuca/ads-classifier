import { Client } from '@elastic/elasticsearch';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const client = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

const prisma = new PrismaClient();

const TARGET_INDEX = 'marketplace_posts_v2';
const SEARCH_HISTORY_INDEX = 'marketplace_search_history';

async function main() {
    try {
        console.log('🔄 Consolidating Elasticsearch indexes...\n');

        // Get all indexes
        const indices = await client.cat.indices({ format: 'json' });
        const marketplaceIndices = indices.filter((idx: any) => 
            idx.index?.includes('marketplace') && 
            idx.index !== TARGET_INDEX && 
            idx.index !== SEARCH_HISTORY_INDEX
        );

        if (marketplaceIndices.length === 0) {
            console.log('✅ No old indexes to consolidate. All indexes are up to date!\n');
        } else {
            console.log(`Found ${marketplaceIndices.length} old index(es) to consolidate:\n`);
            marketplaceIndices.forEach((idx: any) => {
                console.log(`   - ${idx.index} (${idx['docs.count'] || 0} docs)`);
            });
            console.log('');

            // Migrate data from old indexes to target index
            for (const oldIndex of marketplaceIndices) {
                const oldIndexName = oldIndex.index;
                if (!oldIndexName) continue;
                
                console.log(`📦 Migrating data from ${oldIndexName}...`);

                try {
                    // Get all documents from old index
                    const searchResult = await client.search({
                        index: oldIndexName,
                        scroll: '1m',
                        size: 100,
                        body: {
                            query: { match_all: {} },
                        },
                    });

                    let totalMigrated = 0;
                    let scrollId = searchResult._scroll_id;
                    let hits = searchResult.hits.hits;

                    while (hits.length > 0) {
                        // Bulk index to target index
                        const body = hits.flatMap((hit: any) => [
                            { index: { _index: TARGET_INDEX, _id: hit._id } },
                            hit._source,
                        ]);

                        if (body.length > 0) {
                            const bulkResponse = await client.bulk({ body });
                            if (bulkResponse.errors) {
                                console.log(`   ⚠️  Some documents had errors during migration`);
                            }
                            totalMigrated += hits.length;
                        }

                        // Get next batch
                        const scrollResponse = await client.scroll({
                            scroll_id: scrollId!,
                            scroll: '1m',
                        });
                        hits = scrollResponse.hits.hits;
                        scrollId = scrollResponse._scroll_id;
                    }

                    console.log(`   ✅ Migrated ${totalMigrated} documents from ${oldIndexName}`);

            // Delete old index
            if (oldIndexName) {
                console.log(`   🗑️  Deleting old index ${oldIndexName}...`);
                await client.indices.delete({ index: oldIndexName });
                console.log(`   ✅ Deleted ${oldIndexName}\n`);
            }

                } catch (error: any) {
                    console.error(`   ❌ Error migrating ${oldIndexName}:`, error.message);
                }
            }
        }

        // Ensure target index has all current posts from database
        console.log('🔄 Syncing target index with database...');
        const posts = await prisma.post.findMany({
            include: {
                category: true,
                location: true,
                zone: true,
            },
        });

        console.log(`   Found ${posts.length} posts in database`);

        // Clear target index
        const targetExists = await client.indices.exists({ index: TARGET_INDEX });
        if (targetExists) {
            await client.deleteByQuery({
                index: TARGET_INDEX,
                body: { query: { match_all: {} } },
            });
        }

        // Index all posts
        let indexedCount = 0;
        for (const post of posts) {
            await client.index({
                index: TARGET_INDEX,
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
        }

        await client.indices.refresh({ index: TARGET_INDEX });

        console.log(`   ✅ Indexed ${indexedCount} posts to ${TARGET_INDEX}\n`);

        // Final status
        const finalIndices = await client.cat.indices({ format: 'json' });
        const finalMarketplace = finalIndices.filter((idx: any) => 
            idx.index?.includes('marketplace')
        );

        console.log('✅ Consolidation complete!\n');
        console.log('📊 Final marketplace indexes:');
        finalMarketplace.forEach((idx: any) => {
            console.log(`   - ${idx.index}: ${idx['docs.count'] || 0} documents`);
        });

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        await client.close();
    }
}

main();

