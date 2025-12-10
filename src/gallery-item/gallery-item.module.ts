import { Module } from '@nestjs/common';
import { GalleryItemController } from './gallery-item.controller';
import { GalleryItemService } from './gallery-item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryItem } from '../_common/entities/gallery-item.entity';
import { GalleryCategory } from '../_common/entities/gallery-category.entity';
import { I18nModule } from '../i18n/i18n.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([GalleryItem, GalleryCategory]), I18nModule, UploadModule],
  controllers: [GalleryItemController],
  providers: [GalleryItemService]
})
export class GalleryItemModule {}
