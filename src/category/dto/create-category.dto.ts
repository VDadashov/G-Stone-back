import { IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: { az: 'Kateqoriya', en: 'Category', ru: 'Категория' } })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };

  @ApiProperty({ default: true })
  @IsOptional()
  isActive?: boolean;
} 