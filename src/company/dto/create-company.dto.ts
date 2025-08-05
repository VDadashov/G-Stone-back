import { IsNotEmpty, IsOptional, IsObject, IsString, isArray, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({
    example: { az: 'Şirkət', en: 'Company', ru: 'Компания' },
    description:
      'JSON string formatında gönderin: {"az":"Şirkət","en":"Company","ru":"Компания"}',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsObject()
  @IsNotEmpty()
  title: { az: string; en?: string; ru?: string };

  @ApiProperty({
    example: { az: 'Təsvir', en: 'Description', ru: 'Описание' },
    required: false,
    description:
      'JSON string formatında gönderin: {"az":"Təsvir","en":"Description","ru":"Описание"}',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsOptional()
  @IsObject()
  description?: { az: string; en?: string; ru?: string };

  @ApiProperty({
    required: false,
    type: [Number], // Bu number array olduğunu göstərir
    description: 'Category ID-ləri - Array formatında: [1,2,3]',
  })
  @Transform(({ value }) => {
    if (!value || value === '') return undefined;

    if (typeof value === 'string') {
      // Array format: "[1,2,3]"
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed)
            ? parsed.map((id) => parseInt(id)).filter((id) => !isNaN(id))
            : undefined;
        } catch {
          return undefined;
        }
      }

      // Comma-separated və ya tək ID: "1,2,3" və ya "1"
      return value
        .split(',')
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
    }

    return value;
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  categoryIds?: number[];

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Logo faylı (file)',
  })
  @IsOptional()
  logo?: any;

  @ApiProperty({
    example: {
      az: 'Logo alt mətn',
      en: 'Logo alt text',
      ru: 'Альт текст логотипа',
    },
    required: false,
    description:
      'Logo üçün alt mətn - JSON string formatında: {"az":"Logo alt mətn","en":"Logo alt text","ru":"Альт текст логотипа"}',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  @IsOptional()
  @IsObject()
  altText?: { az: string; en?: string; ru?: string };
}
