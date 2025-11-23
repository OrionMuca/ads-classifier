"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv = require("dotenv");
const path_1 = require("path");
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../.env') });
const client = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
});
async function main() {
    try {
        console.log('🔍 Listing all Elasticsearch indexes...\n');
        const indices = await client.cat.indices({ format: 'json' });
        const marketplaceIndices = indices.filter((idx) => idx.index?.includes('marketplace'));
        if (marketplaceIndices.length === 0) {
            console.log('No marketplace indexes found.');
        }
        else {
            console.log(`Found ${marketplaceIndices.length} marketplace index(es):\n`);
            marketplaceIndices.forEach((idx, index) => {
                console.log(`${index + 1}. ${idx.index}`);
                console.log(`   Documents: ${idx['docs.count'] || 0}`);
                console.log(`   Size: ${idx['store.size'] || '0b'}`);
                console.log(`   Status: ${idx.status || 'unknown'}\n`);
            });
        }
        console.log('\n📊 All indexes:');
        indices.forEach((idx) => {
            if (!idx.index?.startsWith('.')) {
                console.log(`   - ${idx.index} (${idx['docs.count'] || 0} docs)`);
            }
        });
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
        await client.close();
    }
}
main();
//# sourceMappingURL=list-indexes.js.map