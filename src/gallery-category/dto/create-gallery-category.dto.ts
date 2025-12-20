import { IsNotEmpty, IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGalleryCategoryDto {
  @ApiProperty({ example: { az: 'Qalereya Kateqoriyası', en: 'Gallery Category', ru: 'Категория Галереи' } })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Main image URL' })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({ example: true, description: 'Active status', default: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true';
    }
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 