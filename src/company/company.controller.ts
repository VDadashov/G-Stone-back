import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, UploadedFile, UseInterceptors, UseFilters, Headers } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Lang } from '../i18n/i18n.decorator';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MulterExceptionFilter } from '../_common/filters/multer-exception.filter';
import { imageFileFilter, imageMaxSize } from '../_common/utils/file-validation.util';
import { fileNameEdit } from '../_common/utils/file-name-edit.util';

@ApiTags('Company')
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create company' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({ status: 201, description: 'Company created' })
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './public/uploads/images',
      filename: fileNameEdit,
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: imageMaxSize },
  }))
  @UseFilters(MulterExceptionFilter)
  create(@Body() dto: CreateCompanyDto, @UploadedFile() logo?: any) {
    if (typeof dto.title === 'string') {
      dto.title = JSON.parse(dto.title);
    }
    if (typeof dto.description === 'string') {
      dto.description = JSON.parse(dto.description);
    }
    return this.companyService.create(dto, logo);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'List of companies' })
  findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.companyService.findAllForAdmin();
    }
    return this.companyService.findAll(acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by id' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'Company detail' })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
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
  @ApiConsumes('multipart/form-data') // File upload için gerekli
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Company updated' })
  @UseInterceptors(FileInterceptor('logo', {
    storage: diskStorage({
      destination: './public/uploads/images',
      filename: fileNameEdit,
    }),
    fileFilter: imageFileFilter,
    limits: { fileSize: imageMaxSize },
  }))
  @UseFilters(MulterExceptionFilter)
  update(@Param('id') id: number, @Body() dto: UpdateCompanyDto, @UploadedFile() logo?: any) {
    // Transform decorator otomatik olarak çalışacak
    // Manual parse işlemine gerek yok
    return this.companyService.update(id, dto, logo);
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