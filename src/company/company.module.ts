import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../_common/entities/company.entity';
import { Admin } from '../_common/entities/admin.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { I18nModule } from '../i18n/i18n.module';
import { Category } from '../_common/entities/category.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Admin, Category]), I18nModule, UploadModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {} 