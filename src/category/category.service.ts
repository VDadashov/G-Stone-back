import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../_common/entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { slugify } from '../_common/utils/slugify';
import { I18nService } from '../i18n/i18n.service';
import { Company } from '../_common/entities/company.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly i18n: I18nService,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly configService: ConfigService,
  ) {}

  private getFullImageUrl(logoPath: string): string | null {
    if (!logoPath) return null;
    const baseUrl = this.configService.get<string>('BASE_URL');
    return `${baseUrl}${logoPath}`;
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepo.create(dto);
    category.slug = dto.title && dto.title.az ? slugify(dto.title.az) : '';
    if (dto.parentId) {
      const parentCategory = await this.categoryRepo.findOneBy({
        id: dto.parentId,
      });
      if (!parentCategory)
        throw new BadRequestException('Parent category tapılmadı');
      category.parent = parentCategory;
    }
    return this.categoryRepo.save(category);
  }

  async findAll(lang?: string) {
    lang = lang || 'az';
    const categories = await this.categoryRepo.find({
      relations: ['parent', 'children', 'companies'],
    });

    return categories.map((c) => ({
      ...c,
      companies:
        c.companies?.map((company) => ({
          id: company.id,
          name: this.i18n.translateField(company.title, lang),
          logo: this.getFullImageUrl(company.logo),
          slug: company.slug,
          // Digər company field-ləri də lazım olduqca əlavə edə bilərsiniz
        })) || [],
      title: this.i18n.translateField(c.title, lang),
      parent: c.parent
        ? {
            id: c.parent.id,
            title: this.i18n.translateField(c.parent.title, lang),
          }
        : null,
      children:
        c.children?.map((child) => ({
          id: child.id,
          title: this.i18n.translateField(child.title, lang),
        })) || [],
    }));
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children', 'companies'],
    });

    if (!category) throw new NotFoundException('Category not found');

    return {
      ...category,
      companies:
        category.companies?.map((company) => ({
          id: company.id,
          name: this.i18n.translateField(company.title, lang),
          logo: this.getFullImageUrl(company.logo),
          slug: company.slug,
          // Digər company field-ləri də lazım olduqca əlavə edə bilərsiniz
        })) || [],
      title: this.i18n.translateField(category.title, lang),
      parent: category.parent
        ? {
            id: category.parent.id,
            title: this.i18n.translateField(category.parent.title, lang),
          }
        : null,
      children:
        category.children?.map((child) => ({
          id: child.id,
          title: this.i18n.translateField(child.title, lang),
        })) || [],
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    const oldTitleAz = category.title?.az;
    Object.assign(category, dto);
    // Əgər title.az dəyişibsə slug yenilənsin
    if (dto.title && dto.title.az && dto.title.az !== oldTitleAz) {
      category.slug = slugify(dto.title.az);
    }
    if (dto.parentId) {
      const parentCategory = await this.categoryRepo.findOneBy({
        id: dto.parentId,
      });
      if (!parentCategory)
        throw new BadRequestException('Parent category tapılmadı');
      category.parent = parentCategory;
    }
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new NotFoundException('Category not found');
    await this.categoryRepo.remove(category);
    return { deleted: true };
  }

  async findAllForAdmin() {
    const categories = await this.categoryRepo.find({
      relations: ['parent', 'children', 'companies'],
    });
    return categories.map((c) => ({
      ...c,
      companies:
        c.companies?.map((company) => ({
          id: company.id,
          title: company.title,
        })) || [],
      title: c.title,
      parent: c.parent ? { id: c.parent.id, title: c.parent.title } : null,
      children:
        c.children?.map((child) => ({ id: child.id, title: child.title })) ||
        [],
    }));
  }

  async findOneForAdmin(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children', 'companies'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return {
      ...category,
      companies:
        category.companies?.map((company) => ({
          id: company.id,
          title: company.title,
        })) || [],
      title: category.title,
      parent: category.parent
        ? { id: category.parent.id, title: category.parent.title }
        : null,
      children:
        category.children?.map((child) => ({
          id: child.id,
          title: child.title,
        })) || [],
    };
  }
} 