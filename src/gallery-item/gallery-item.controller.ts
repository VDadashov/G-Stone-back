import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Headers, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { GalleryItemService } from './gallery-item.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';

@ApiTags('Gallery Item')
@Controller('gallery-item')
export class GalleryItemController {
  constructor(
    private readonly galleryItemService: GalleryItemService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create gallery item' })
  @ApiBody({ type: CreateGalleryItemDto })
  @ApiResponse({ status: 201, description: 'Gallery item created' })
  async create(@Body() dto: CreateGalleryItemDto) {
    // Basic validation
    if (!dto.galleryCategoryId) {
      throw new BadRequestException('galleryCategoryId məcburidir');
    }

    // Transform imageList if it's a string (from JSON)
    if (typeof dto.imageList === 'string') {
      try {
        dto.imageList = JSON.parse(dto.imageList);
      } catch (error) {
        dto.imageList = [];
      }
    }

    return this.galleryItemService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all gallery items' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'List of gallery items' })
  findAll(
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.galleryItemService.findAllForAdmin();
    }
    return this.galleryItemService.findAll(acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get gallery item by id' })
  @ApiQuery({ name: 'allLanguages', required: false, type: Boolean, description: 'Admin üçün bütün dillər' })
  @ApiResponse({ status: 200, description: 'Gallery item detail' })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: boolean,
    @Headers('accept-language') acceptLanguage?: string
  ) {
    if (allLanguages) {
      return this.galleryItemService.findOneForAdmin(id);
    }
    return this.galleryItemService.findOne(id, acceptLanguage);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update gallery item' })
  @ApiBody({ type: UpdateGalleryItemDto })
  @ApiResponse({ status: 200, description: 'Gallery item updated' })
  async update(@Param('id') id: number, @Body() dto: UpdateGalleryItemDto) {
    // Transform imageList if it's a string (from JSON)
    if (typeof dto.imageList === 'string') {
      try {
        dto.imageList = JSON.parse(dto.imageList);
      } catch (error) {
        dto.imageList = [];
      }
    }

    return this.galleryItemService.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete gallery item' })
  @ApiResponse({ status: 200, description: 'Gallery item deleted' })
  remove(@Param('id') id: number) {
    return this.galleryItemService.remove(id);
  }
}