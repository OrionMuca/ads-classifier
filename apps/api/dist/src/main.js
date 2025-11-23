"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        credentials: false,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: [],
        maxAge: 86400,
    });
    app.useStaticAssets((0, path_1.join)(process.cwd(), 'uploads'), {
        prefix: '/uploads/',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = process.env.PORT || 3000;
    const host = '0.0.0.0';
    await app.listen(port, host, () => {
        console.log(`🚀 Backend API running on http://0.0.0.0:${port}`);
        console.log(`📱 Accessible from network:`);
        console.log(`   - http://192.168.1.7:${port}`);
        console.log(`   - http://192.168.88.235:${port}`);
        console.log(`   - http://localhost:${port} (local)`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map