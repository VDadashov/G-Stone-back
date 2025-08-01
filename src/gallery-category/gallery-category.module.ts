import { Module } from '@nestjs/common';
import { GalleryCategoryController } from './gallery-category.controller';
import { GalleryCategoryService } from './gallery-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryCategory } from '../_common/entities/gallery-category.entity';
import { I18nModule } from '../i18n/i18n.module';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryCategory]), I18nModule],
  controllers: [GalleryCategoryController],
  providers: [GalleryCategoryService]
})
export class GalleryCategoryModule {} 