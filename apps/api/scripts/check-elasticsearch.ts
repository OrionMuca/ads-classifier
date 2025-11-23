import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const client = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

const indexName = 'marketplace_posts_v2';

async function checkElasticsearch() {
    try {
        console.log('🔍 Checking Elasticsearch connection...\n');

        // Check if cluster is running
        const health = await client.cluster.health();
        console.log('✅ Elasticsearch cluster status:', health.status);
        console.log('   Cluster name:', health.cluster_name);
        console.log('   Number of nodes:', health.number_of_nodes);
        console.log('');

        // Check if index exists
        const indexExists = await client.indices.exists({ index: indexName });
        console.log(`📇 Index "${indexName}" exists:`, indexExists);
        console.log('');

        if (indexExists) {
            // Get index stats
            const stats = await client.indices.stats({ index: indexName });
            const docCount = stats.indices?.[indexName]?.total?.docs?.count || 0;
            console.log(`📊 Total documents in index: ${docCount}`);
            console.log('');

            // Get a few sample documents
            if (docCount > 0) {
                const searchResult = await client.search({
                    index: indexName,
                    size: 5,
                    body: {
                        query: { match_all: {} },
                    },
                });

                console.log('📄 Sample documents:');
                searchResult.hits.hits.forEach((hit: any, index: number) => {
                    console.log(`\n${index + 1}. ID: ${hit._id}`);
                    console.log(`   Title: ${hit._source.title}`);
                    console.log(`   Price: ${hit._source.price}`);
                    console.log(`   Status: ${hit._source.status}`);
                });
                console.log('');

                // Check for specific post
                const postId = process.argv[2];
                if (postId) {
                    console.log(`🔎 Searching for post ID: ${postId}`);
                    try {
                        const doc = await client.get({
                            index: indexName,
                            id: postId,
                        });
                        console.log('✅ Post found in Elasticsearch:');
                        console.log(JSON.stringify(doc._source, null, 2));
                    } catch (error: any) {
                        if (error.statusCode === 404) {
                            console.log('❌ Post not found in Elasticsearch');
                        } else {
                            console.log('❌ Error:', error.message);
                        }
                    }
                }
            } else {
                console.log('⚠️  Index exists but has no documents. You may need to reindex.');
            }
        } else {
            console.log('⚠️  Index does not exist. It will be created when the app starts.');
        }

        // Show how to access Elasticsearch
        console.log('\n📖 How to view Elasticsearch data:');
        console.log('   1. Use Kibana (recommended): http://localhost:5601');
        console.log('   2. Use Elasticsearch API: curl http://localhost:9200/' + indexName + '/_search?pretty');
        console.log('   3. Use this script: npm run check:elasticsearch [postId]');
        console.log('   4. Use Dev Tools in Kibana:');
        console.log('      GET ' + indexName + '/_search');
        console.log('      {');
        console.log('        "query": { "match_all": {} }');
        console.log('      }');

    } catch (error: any) {
        console.error('❌ Error connecting to Elasticsearch:', error.message);
        console.error('\n💡 Make sure Elasticsearch is running:');
        console.error('   - Check docker-compose.yml');
        console.error('   - Run: docker-compose up elasticsearch');
        console.error('   - Or check ELASTICSEARCH_NODE in .env file');
        process.exit(1);
    } finally {
        await client.close();
    }
}

checkElasticsearch();

