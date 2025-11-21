
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
