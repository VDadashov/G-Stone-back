import { IsNotEmpty, IsObject, IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: { az: 'Açıqlama', en: 'Description', ru: 'Описание' }, required: false })
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

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Gallery item image' })
  @IsOptional()
  mainImage?: string;

  @ApiProperty({ type: 'string', format: 'binary', isArray: true, required: false, description: 'Gallery item images' })
  @IsOptional()
  imageList?: string[];

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