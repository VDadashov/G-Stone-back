import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { typeOrmConfig } from './config/typeorm.config';
import { I18nModule } from './i18n/i18n.module';
import { CompanyModule } from './company/company.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/product.module';
import { GalleryCategoryModule } from './gallery-category/gallery-category.module';
import { GalleryItemModule } from './gallery-item/gallery-item.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    I18nModule,
    CompanyModule,
    UploadModule,
    AuthModule,
    CategoryModule,
    ProductModule,
    UploadModule,
    GalleryCategoryModule,
    GalleryItemModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
