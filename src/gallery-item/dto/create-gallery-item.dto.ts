import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Alt text üçün ayrıca class
export class ImageWithAltText {
  @ApiProperty({ description: 'Image URL or file path' })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: {
      az: 'Şəkil açıqlaması',
      en: 'Image description',
      ru: 'Описание изображения',
    },
    description: 'Alt text for accessibility in multiple languages',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch (error) {
        return {};
      }
    }
    return value || {};
  })
  @IsObject()
  @IsNotEmpty()
  altText: { az: string; en?: string; ru?: string };
}

export class CreateGalleryItemDto {
  @ApiProperty({
    example: {
      az: 'Qalereya Elementi',
      en: 'Gallery Item',
      ru: 'Элемент Галереи',
    },
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch (error) {
        return {};
      }
    }
    return value || {};
  })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };

  @ApiProperty({
    example: { az: 'Açıqlama', en: 'Description', ru: 'Описание' },
    required: false,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed
          : {};
      } catch (error) {
        return {};
      }
    }
    return value || {};
  })
  @IsOptional()
  @IsObject()
  description?: { az: string; en?: string; ru?: string };

  // Ana şəkil alt text ilə birlikdə
  @ApiProperty({
    type: ImageWithAltText,
    required: false,
    description: 'Main gallery image with alt text',
    example: {
      url: 'image.jpg',
      altText: {
        az: 'Ana şəkil açıqlaması',
        en: 'Main image description',
        ru: 'Описание главного изображения',
      },
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ImageWithAltText)
  @Transform(({ value }) => {
    // Əgər string olaraq gəlirsə, JSON parse et
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return null;
      }
    }
    return value;
  })
  mainImage?: ImageWithAltText;

  // Şəkillər siyahısı hər biri öz alt text-i ilə
  @ApiProperty({
    type: [ImageWithAltText],
    required: false,
    description: 'List of gallery images with alt texts',
    example: [
      {
        url: 'image1.jpg',
        altText: {
          az: 'Birinci şəkil',
          en: 'First image',
          ru: 'Первое изображение',
        },
      },
      {
        url: 'image2.jpg',
        altText: {
          az: 'İkinci şəkil',
          en: 'Second image',
          ru: 'Второе изображение',
        },
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageWithAltText)
  @Transform(({ value }) => {
    // Əgər string olaraq gəlirsə, JSON parse et
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    return value || [];
  })
  imageList?: ImageWithAltText[];

  @ApiProperty({ required: true, description: 'Gallery Category ID' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsNotEmpty()
  @IsNumber()
  galleryCategoryId: number;
}
