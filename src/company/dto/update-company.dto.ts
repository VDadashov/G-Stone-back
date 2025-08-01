import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';
import { IsOptional } from 'class-validator';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    required: false, 
    description: 'Logo faylı (file) - yeni logo yüklemek için' 
  })
  @IsOptional()
  logo?: any;

} 