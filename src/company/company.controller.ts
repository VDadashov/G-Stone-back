import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Company created' })
  async create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto, dto.logo);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({ status: 200, description: 'List of companies' })
  findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      return this.companyService.findAllForAdmin();
    }
    return this.companyService.findAll(acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Admin üçün bütün dillər',
  })
  @ApiResponse({ status: 200, description: 'Company detail' })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages) {
      return this.companyService.findOneForAdmin(id);
    }
    return this.companyService.findOne(id, acceptLanguage);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update company' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Company updated' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, dto, dto.logo);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted' })
  remove(@Param('id') id: number) {
    return this.companyService.remove(id);
  }
}
