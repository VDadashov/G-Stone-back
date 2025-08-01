import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { GalleryItemService } from './gallery-item.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { ImageWithAltText } from './dto/create-gallery-item.dto';

@ApiTags('gallery-items')
@Controller('gallery-items')
export class GalleryItemController {
  constructor(private readonly galleryItemService: GalleryItemService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Gallery item creation with file upload',
    type: CreateGalleryItemDto,
  })
  async create(
    @Body() createGalleryItemDto: CreateGalleryItemDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // Handle file uploads by converting them to ImageWithAltText format
    if (files && files.length > 0) {
      const imageList: ImageWithAltText[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imagePath = file.path.replace('public/', '');

        // Create ImageWithAltText object
        const imageWithAlt: ImageWithAltText = {
          url: imagePath,
          altText: {
            az: `Şəkil ${i + 1}`, // Default alt text in Azerbaijani
            en: `Image ${i + 1}`, // Default alt text in English
            ru: `Изображение ${i + 1}`, // Default alt text in Russian
          },
        };

        // Set first image as main image if not already set
        if (i === 0 && !createGalleryItemDto.mainImage) {
          createGalleryItemDto.mainImage = imageWithAlt;
        }

        imageList.push(imageWithAlt);
      }

      // Update DTO with processed images
      createGalleryItemDto.imageList = imageList;
    }

    return this.galleryItemService.create(createGalleryItemDto, files);
  }

  @Get()
  findAll(@Query('lang') lang?: string) {
    return this.galleryItemService.findAll(lang);
  }

  @Get('admin')
  findAllForAdmin() {
    return this.galleryItemService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query('lang') lang?: string) {
    return this.galleryItemService.findOne(+id, lang);
  }

  @Get('admin/:id')
  findOneForAdmin(@Param('id') id: string) {
    return this.galleryItemService.findOneForAdmin(+id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Gallery item update with file upload',
    type: UpdateGalleryItemDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateGalleryItemDto: UpdateGalleryItemDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    // Handle file uploads by converting them to ImageWithAltText format
    if (files && files.length > 0) {
      const imageList: ImageWithAltText[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imagePath = file.path.replace('public/', '');

        // Create ImageWithAltText object
        const imageWithAlt: ImageWithAltText = {
          url: imagePath,
          altText: {
            az: `Yenilənmiş şəkil ${i + 1}`, // Default alt text in Azerbaijani
            en: `Updated image ${i + 1}`, // Default alt text in English
            ru: `Обновленное изображение ${i + 1}`, // Default alt text in Russian
          },
        };

        // Set first image as main image if not already set
        if (i === 0 && !updateGalleryItemDto.mainImage) {
          updateGalleryItemDto.mainImage = imageWithAlt;
        }

        imageList.push(imageWithAlt);
      }

      // Update DTO with processed images
      updateGalleryItemDto.imageList = imageList;
    }

    return this.galleryItemService.update(+id, updateGalleryItemDto, files);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryItemService.remove(+id);
  }
}
