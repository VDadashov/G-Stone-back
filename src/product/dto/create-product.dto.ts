import { IsNotEmpty, IsOptional, IsObject, IsString, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: { az: 'Məhsul', en: 'Product', ru: 'Товар' } })
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

  @ApiProperty({ example: { az: 'Açıqlama', en: 'Description', ru: 'Описание' }, required: false })
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
  @IsOptional()
  @IsObject()
  description?: { az: string; en?: string; ru?: string };

  @ApiProperty({ 
    type: 'string', 
    required: false, 
    description: 'Main product image URL',
    example: 'https://example.com/image.png'
  })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({ 
    type: [String], 
    required: false, 
    description: 'Product image URLs array',
    example: ['https://example.com/image1.png', 'https://example.com/image2.png']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageList?: string[];

  @ApiProperty({ 
    type: 'string', 
    required: false, 
    description: 'Product PDF URL',
    example: 'https://example.com/product.pdf'
  })
  @IsOptional()
  @IsString()
  detailPdf?: string;

  @ApiProperty({ required: true, description: 'Category ID' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ required: true, description: 'Company ID' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const num = parseInt(value, 10);
      return isNaN(num) ? value : num;
    }
    return value;
  })
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @ApiProperty({ default: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value === 'true' || value === '1';
    }
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}