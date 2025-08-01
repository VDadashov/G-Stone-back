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

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Product image' })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({ type: 'string', format: 'binary', isArray: true, required: false, description: 'Product images' })
  @IsOptional()
  @IsArray()
  imageList?: string[];

  @ApiProperty({ type: 'string', format: 'binary', required: false, description: 'Product PDF' })
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