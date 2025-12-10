import { IsNotEmpty, IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGalleryCategoryDto {
  @ApiProperty({ example: { az: 'Qalereya Kateqoriyası', en: 'Gallery Category', ru: 'Категория Галереи' } })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg', description: 'Main image URL' })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiPropertyOptional({ example: true, description: 'Active status', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 