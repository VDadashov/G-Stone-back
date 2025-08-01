import { IsNotEmpty, IsOptional, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ 
    example: { az: 'Şirkət', en: 'Company', ru: 'Компания' },
    description: 'JSON string formatında gönderin: {"az":"Şirkət","en":"Company","ru":"Компания"}'
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
    description: 'JSON string formatında gönderin: {"az":"Təsvir","en":"Description","ru":"Описание"}'
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
    type: [Number], 
    description: 'Əlaqəli category id-ləri - JSON array formatında: [1,2,3]' 
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
  categoryIds?: number[];

  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    required: false, 
    description: 'Logo faylı (file)' 
  })
  @IsOptional()
  logo?: any;
}