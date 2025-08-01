import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryItem } from '../_common/entities/gallery-item.entity';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { I18nService } from '../i18n/i18n.service';
import { GalleryCategory } from '../_common/entities/gallery-category.entity';

@Injectable()
export class GalleryItemService {
  constructor(
    @InjectRepository(GalleryItem)
    private readonly galleryItemRepo: Repository<GalleryItem>,
    @InjectRepository(GalleryCategory)
    private readonly galleryCategoryRepo: Repository<GalleryCategory>,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateGalleryItemDto, files: Array<Express.Multer.File>) {
    const galleryCategory = await this.galleryCategoryRepo.findOneBy({
      id: dto.galleryCategoryId,
    });
    if (!galleryCategory) {
      throw new NotFoundException('Gallery Category not found');
    }

    // Create entity with compatible data structure
    const galleryItem = this.galleryItemRepo.create({
      title: dto.title,
      description: dto.description,
    });

    galleryItem.galleryCategory = galleryCategory;

    // Handle file uploads (priority over DTO data)
    if (files && files.length > 0) {
      const imagePaths: string[] = [];

      for (const file of files) {
        const imagePath = file.path.replace('public', '');
        imagePaths.push(imagePath);

        // Set first uploaded file as main image if not already set
        if (!galleryItem.mainImage) {
          galleryItem.mainImage = imagePath;
        }
      }

      galleryItem.imageList = imagePaths;
    } else {
      // Handle DTO image data when no files are uploaded
      if (dto.mainImage?.url) {
        galleryItem.mainImage = dto.mainImage.url;
      }

      if (dto.imageList && dto.imageList.length > 0) {
        galleryItem.imageList = dto.imageList.map((img) => img.url);
      } else {
        galleryItem.imageList = [];
      }
    }

    return this.galleryItemRepo.save(galleryItem);
  }

  async findAll(lang?: string) {
    lang = lang || 'az';
    const items = await this.galleryItemRepo.find({
      relations: ['galleryCategory'],
    });
    return items.map((item) => ({
      ...item,
      title: this.i18n.translateField(item.title, lang),
      description: this.i18n.translateField(item.description, lang),
      galleryCategory: item.galleryCategory
        ? {
            id: item.galleryCategory.id,
            title: this.i18n.translateField(item.galleryCategory.title, lang),
          }
        : null,
    }));
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const item = await this.galleryItemRepo.findOne({
      where: { id },
      relations: ['galleryCategory'],
    });

    if (!item) {
      throw new NotFoundException('Gallery Item not found');
    }

    return {
      ...item,
      title: this.i18n.translateField(item.title, lang),
      description: this.i18n.translateField(item.description, lang),
      galleryCategory: item.galleryCategory
        ? {
            id: item.galleryCategory.id,
            title: this.i18n.translateField(item.galleryCategory.title, lang),
          }
        : null,
    };
  }

  async update(
    id: number,
    dto: UpdateGalleryItemDto,
    files: Array<Express.Multer.File>,
  ) {
    const item = await this.galleryItemRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Gallery Item not found');
    }

    // Update category if provided
    if (dto.galleryCategoryId) {
      const galleryCategory = await this.galleryCategoryRepo.findOneBy({
        id: dto.galleryCategoryId,
      });
      if (!galleryCategory) {
        throw new NotFoundException('Gallery Category not found');
      }
      item.galleryCategory = galleryCategory;
    }

    // Update basic fields
    if (dto.title) item.title = dto.title;
    if (dto.description) item.description = dto.description;

    // Handle file uploads (priority over DTO data)
    if (files && files.length > 0) {
      const imagePaths: string[] = [];

      for (const file of files) {
        const imagePath = file.path.replace('public', '');
        imagePaths.push(imagePath);

        // Set first uploaded file as main image if not already set
        if (!item.mainImage) {
          item.mainImage = imagePath;
        }
      }

      item.imageList = imagePaths;
    } else {
      // Handle DTO image data when no files are uploaded
      if (dto.mainImage?.url) {
        item.mainImage = dto.mainImage.url;
      }

      if (dto.imageList && dto.imageList.length > 0) {
        item.imageList = dto.imageList.map((img) => img.url);
      } else if (dto.imageList !== undefined) {
        // Only reset if explicitly provided (even if empty)
        item.imageList = [];
      }
    }

    return this.galleryItemRepo.save(item);
  }

  async remove(id: number) {
    const item = await this.galleryItemRepo.findOneBy({ id });
    if (!item) {
      throw new NotFoundException('Gallery Item not found');
    }
    await this.galleryItemRepo.remove(item);
    return { deleted: true };
  }

  async findAllForAdmin() {
    const items = await this.galleryItemRepo.find({
      relations: ['galleryCategory'],
    });
    return items.map((item) => ({
      ...item,
      title: item.title,
      description: item.description,
      galleryCategory: item.galleryCategory
        ? {
            id: item.galleryCategory.id,
            title: item.galleryCategory.title,
          }
        : null,
    }));
  }

  async findOneForAdmin(id: number) {
    const item = await this.galleryItemRepo.findOne({
      where: { id },
      relations: ['galleryCategory'],
    });

    if (!item) {
      throw new NotFoundException('Gallery Item not found');
    }

    return {
      ...item,
      title: item.title,
      description: item.description,
      galleryCategory: item.galleryCategory
        ? {
            id: item.galleryCategory.id,
            title: item.galleryCategory.title,
          }
        : null,
    };
  }
}
