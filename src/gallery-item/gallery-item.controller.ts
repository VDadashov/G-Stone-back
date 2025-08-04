import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Headers, UploadedFiles, UseInterceptors, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { GalleryItemService } from './gallery-item.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { JwtAuthGuard } from '../_common/guards/jwt-auth.guard';
import { Roles } from '../_common/decorators/roles.decorator';
import { RolesGuard } from '../_common/guards/roles.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

function fileNameEdit(req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + extname(file.originalname));
}

@ApiTags('Gallery Item')
@Controller('gallery-item')
export class GalleryItemController {
  constructor(private readonly galleryItemService: GalleryItemService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create gallery item' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateGalleryItemDto })
  @ApiResponse({ status: 201, description: 'Gallery item created' })
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: './public/uploads/images',
      filename: fileNameEdit,
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  create(@Body() dto: CreateGalleryItemDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    // DTO transformations will handle parsing, no manual parsing needed
    
    // Basic validation
    if (!dto.galleryCategoryId) {
      throw new BadRequestException('galleryCategoryId məcburidir');
    }

    // Handle file uploads
    if (files && files.length) {
      dto.imageList = [];
      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          if (!dto.mainImage) {
            dto.mainImage = file.path.replace('public/', '');
          }
          dto.imageList.push(file.path.replace('public/', ''));
        }
      }
    }

    // Ensure imageList is always an array
    if (!dto.imageList) {
      dto.imageList = [];
    }

    return this.galleryItemService.create(dto, files);
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateGalleryItemDto })
  @ApiResponse({ status: 200, description: 'Gallery item updated' })
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: './public/uploads/images',
      filename: fileNameEdit,
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  update(@Param('id') id: number, @Body() dto: UpdateGalleryItemDto, @UploadedFiles() files: Array<Express.Multer.File>) {
    // DTO transformations will handle parsing, no manual parsing needed

    // Handle file uploads
    if (files && files.length) {
      dto.imageList = [];
      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          if (!dto.mainImage) {
            dto.mainImage = file.path.replace('public/', '');
          }
          dto.imageList.push(file.path.replace('public/', ''));
        }
      }
    }

    // Ensure imageList is always an array
    if (!dto.imageList) {
      dto.imageList = [];
    }

    return this.galleryItemService.update(id, dto, files);
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