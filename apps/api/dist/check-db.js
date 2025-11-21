"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    console.log(`Users: ${userCount}`);
    console.log(`Posts: ${postCount}`);
}
main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
//# sourceMappingURL=check-db.js.map