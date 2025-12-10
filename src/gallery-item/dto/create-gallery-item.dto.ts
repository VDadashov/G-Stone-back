import { IsNotEmpty, IsObject, IsOptional, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ImageItemDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiProperty({ example: true })
  @IsOptional()
  isMain?: boolean;
}

export class CreateGalleryItemDto {
  @ApiProperty({ example: { az: 'Qalereya Elementi', en: 'Gallery Item', ru: 'Элемент Галереи' } })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // Ensure the parsed value is an object and not null/array
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      } catch (error) {
        // Return empty object if parsing fails
        return {};
      }
    }
    return value || {};
  })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };

  @ApiPropertyOptional({ example: { az: 'Açıqlama', en: 'Description', ru: 'Описание' } })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // Ensure the parsed value is an object and not null/array
        return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
      } catch (error) {
        // Return empty object if parsing fails
        return {};
      }
    }
    return value || {};
  })
  @IsOptional()
  @IsObject()
  description?: { az: string; en?: string; ru?: string };

  @ApiPropertyOptional({ 
    type: [ImageItemDto],
    example: [
      { url: 'https://example.com/image1.jpg', isMain: true },
      { url: 'https://example.com/image2.jpg', isMain: false }
    ],
    description: 'Array of image objects with url and isMain properties'
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  imageList?: Array<{ url: string; isMain?: boolean }>;

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