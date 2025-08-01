import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Headers } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Lang } from '../i18n/i18n.decorator';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Category')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created' })
  create(@Body() dto: CreateCategoryDto) {
    if (typeof dto.title === 'string') dto.title = JSON.parse(dto.title);
    return this.categoryService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.categoryService.findAllForAdmin();
    }
    return this.categoryService.findAll(acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by id' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'Category detail' })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.categoryService.findOneForAdmin(id);
    }
    return this.categoryService.findOne(id, acceptLanguage);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update category' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated' })
  update(@Param('id') id: number, @Body() dto: UpdateCategoryDto) {
    if (typeof dto.title === 'string') dto.title = JSON.parse(dto.title);
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({ status: 200, description: 'Category deleted' })
  remove(@Param('id') id: number) {
    return this.categoryService.remove(id);
  }
} 