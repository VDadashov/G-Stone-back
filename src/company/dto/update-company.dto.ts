import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiProperty({ 
    type: 'string', 
    required: false, 
    description: 'Logo URL',
    example: 'https://example.com/logo.png'
  })
  @IsOptional()
  @IsString()
  logo?: string;
} 