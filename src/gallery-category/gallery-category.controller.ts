import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { GalleryCategoryService } from './gallery-category.service';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Gallery Category')
@Controller('gallery-category')
export class GalleryCategoryController {
  constructor(private readonly galleryCategoryService: GalleryCategoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create gallery category' })
  @ApiBody({ type: CreateGalleryCategoryDto })
  @ApiResponse({ status: 201, description: 'Gallery category created' })
  create(@Body() dto: CreateGalleryCategoryDto) {
    if (typeof dto.title === 'string') dto.title = JSON.parse(dto.title);
    return this.galleryCategoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gallery categories' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['az', 'za', 'newest', 'oldest'],
    description: 'Sıralama növü',
  })
  @ApiResponse({ status: 200, description: 'List of gallery categories' })
  findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Query('isActive') isActive?: string,
    @Query('sort') sort?: string,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.galleryCategoryService.findAllForAdmin();
    }
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.galleryCategoryService.findAll(acceptLanguage, isActiveBool, sort);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get gallery category by slug with items' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'Gallery category detail with items' })
  findBySlug(
    @Param('slug') slug: string,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.galleryCategoryService.findBySlugForAdmin(slug);
    }
    return this.galleryCategoryService.findBySlug(slug, acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gallery category by id' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'Gallery category detail' })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.galleryCategoryService.findOneForAdmin(id);
    }
    return this.galleryCategoryService.findOne(id, acceptLanguage);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update gallery category' })
  @ApiBody({ type: UpdateGalleryCategoryDto })
  @ApiResponse({ status: 200, description: 'Gallery category updated' })
  update(@Param('id') id: number, @Body() dto: UpdateGalleryCategoryDto) {
    if (typeof dto.title === 'string') dto.title = JSON.parse(dto.title);
    return this.galleryCategoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete gallery category' })
  @ApiResponse({ status: 200, description: 'Gallery category deleted' })
  remove(@Param('id') id: number) {
    return this.galleryCategoryService.remove(id);
  }
} 