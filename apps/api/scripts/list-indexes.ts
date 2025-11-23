import { Client } from '@elastic/elasticsearch';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const client = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});

async function main() {
    try {
        console.log('🔍 Listing all Elasticsearch indexes...\n');

        // Get all indexes
        const indices = await client.cat.indices({ format: 'json' });
        
        const marketplaceIndices = indices.filter((idx: any) => 
            idx.index?.includes('marketplace')
        );

        if (marketplaceIndices.length === 0) {
            console.log('No marketplace indexes found.');
        } else {
            console.log(`Found ${marketplaceIndices.length} marketplace index(es):\n`);
            marketplaceIndices.forEach((idx: any, index: number) => {
                console.log(`${index + 1}. ${idx.index}`);
                console.log(`   Documents: ${idx['docs.count'] || 0}`);
                console.log(`   Size: ${idx['store.size'] || '0b'}`);
                console.log(`   Status: ${idx.status || 'unknown'}\n`);
            });
        }

        // Get all indexes (including system ones)
        console.log('\n📊 All indexes:');
        indices.forEach((idx: any) => {
            if (!idx.index?.startsWith('.')) {
                console.log(`   - ${idx.index} (${idx['docs.count'] || 0} docs)`);
            }
        });

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.error('\n💡 Make sure Elasticsearch is running:');
            console.error('   docker-compose up elasticsearch');
        }
        process.exit(1);
    } finally {
        await client.close();
    }
}

main();

