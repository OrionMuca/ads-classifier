"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const postId = process.argv[2];
    if (!postId) {
        console.log('Usage: npm run check:post <postId>');
        console.log('Example: npm run check:post 96d9c944-8d5a-4071-9c24-54d5d058b53f');
        process.exit(1);
    }
    console.log(`🔍 Checking post with ID: ${postId}\n`);
    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
                location: true,
                zone: true,
            },
        });
        if (post) {
            console.log('✅ Post found in database:');
            console.log(`   Title: ${post.title}`);
            console.log(`   Price: ${post.price}`);
            console.log(`   Status: ${post.status}`);
            console.log(`   Category: ${post.category?.name || 'N/A'}`);
            console.log(`   Location: ${post.location?.city || 'N/A'}`);
            console.log(`   User: ${post.user?.email || 'N/A'}`);
            console.log(`   Created: ${post.createdAt}`);
        }
        else {
            console.log('❌ Post not found in database');
            console.log('\n💡 Possible reasons:');
            console.log('   1. Post was deleted');
            console.log('   2. Post ID is incorrect');
            console.log('   3. Database was reset and not reseeded');
            console.log('\n💡 Try running: npm run seed');
        }
        const totalPosts = await prisma.post.count();
        const activePosts = await prisma.post.count({ where: { status: 'ACTIVE' } });
        console.log(`\n📊 Database stats:`);
        console.log(`   Total posts: ${totalPosts}`);
        console.log(`   Active posts: ${activePosts}`);
    }
    catch (error) {
        console.error('❌ Error:', error.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check-post.js.map