import { IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGalleryCategoryDto {
  @ApiProperty({ example: { az: 'Qalereya Kateqoriyası', en: 'Gallery Category', ru: 'Категория Галереи' } })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };
} 