import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../_common/entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Company } from '../_common/entities/company.entity';
import { Category } from '../_common/entities/category.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Company, Category]), UploadModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {} 