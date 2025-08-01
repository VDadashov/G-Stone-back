import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryCategory } from '../_common/entities/gallery-category.entity';
import { CreateGalleryCategoryDto } from './dto/create-gallery-category.dto';
import { UpdateGalleryCategoryDto } from './dto/update-gallery-category.dto';
import { slugify } from '../_common/utils/slugify';
import { I18nService } from '../i18n/i18n.service';

@Injectable()
export class GalleryCategoryService {
  constructor(
    @InjectRepository(GalleryCategory)
    private readonly galleryCategoryRepo: Repository<GalleryCategory>,
    private readonly i18n: I18nService,
  ) {}

  async create(dto: CreateGalleryCategoryDto) {
    const galleryCategory = this.galleryCategoryRepo.create(dto);
    galleryCategory.slug = dto.title && dto.title.az ? slugify(dto.title.az) : '';
    return this.galleryCategoryRepo.save(galleryCategory);
  }

  async findAll(lang?: string) {
    lang = lang || 'az';
    const categories = await this.galleryCategoryRepo.find();
    return categories.map((c) => ({
      ...c,
      title: this.i18n.translateField(c.title, lang),
    }));
  }

  async findAllForAdmin() {
    const categories = await this.galleryCategoryRepo.find();
    return categories.map((c) => ({
      ...c,
      title: c.title,
    }));
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const category = await this.galleryCategoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Gallery Category not found');
    }
    return {
      ...category,
      title: this.i18n.translateField(category.title, lang),
    };
  }

  async findOneForAdmin(id: number) {
    const category = await this.galleryCategoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Gallery Category not found');
    }
    return {
      ...category,
      title: category.title,
    };
  }

  async update(id: number, dto: UpdateGalleryCategoryDto) {
    const category = await this.galleryCategoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Gallery Category not found');
    }
    const oldTitleAz = category.title?.az;
    Object.assign(category, dto);
    if (dto.title && dto.title.az && dto.title.az !== oldTitleAz) {
      category.slug = slugify(dto.title.az);
    }
    return this.galleryCategoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.galleryCategoryRepo.findOneBy({ id });
    if (!category) {
      throw new NotFoundException('Gallery Category not found');
    }
    await this.galleryCategoryRepo.remove(category);
    return { deleted: true };
  }
} 