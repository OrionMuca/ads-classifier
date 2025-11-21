const bcrypt = require('bcrypt');
async function hash() {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
}
hash();
//# sourceMappingURL=hash-password.js.map