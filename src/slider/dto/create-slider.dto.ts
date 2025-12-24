import { IsNotEmpty, IsObject, IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSliderDto {
  @ApiProperty({ example: { az: 'Başlıq', en: 'Title', ru: 'Заголовок' } })
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

  @ApiProperty({ example: { az: 'Alt başlıq', en: 'Subtitle', ru: 'Подзаголовок' } })
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
  subtitle: { az: string; en?: string; ru?: string };

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Slider image URL' })
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @ApiPropertyOptional({ example: 0, description: 'Display order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

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

