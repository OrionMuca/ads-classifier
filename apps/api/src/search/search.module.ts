import { Module, forwardRef } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchService } from './elasticsearch.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CategoriesModule)],
  providers: [SearchService, ElasticsearchService],
  controllers: [SearchController],
  exports: [ElasticsearchService],
})
export class SearchModule { }
