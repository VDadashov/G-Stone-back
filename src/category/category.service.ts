import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.categoryRepo.save(category);
  }

  async getAll(lang?: string) {
    lang = lang || 'az';
    const categories = await this.categoryRepo.find({
      relations: ['companies'],
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
    }));
  }

  async findAll(lang?: string, isActive?: boolean, search?: string, categorySlug?: string, companySlug?: string) {
    lang = lang || 'az';
    const queryBuilder = this.categoryRepo.createQueryBuilder('category')
      .leftJoinAndSelect('category.companies', 'companies');

    const conditions: string[] = [];
    const params: any = {};

    if (isActive !== undefined) {
      conditions.push('category.isActive = :isActive');
      params.isActive = isActive;
    }

    if (search) {
      conditions.push(
        '(category.title::text ILIKE :search OR category.title->>\'az\' ILIKE :search OR category.title->>\'en\' ILIKE :search OR category.title->>\'ru\' ILIKE :search)'
      );
      params.search = `%${search}%`;
    }

    // Category slug filter (optional)
    if (categorySlug) {
      conditions.push('category.slug = :categorySlug');
      params.categorySlug = categorySlug;
    }

    // Company slug filter (optional)
    if (companySlug) {
      conditions.push('companies.slug = :companySlug');
      params.companySlug = companySlug;
    }

    if (conditions.length > 0) {
      queryBuilder.where(conditions.join(' AND '), params);
    }

    const categories = await queryBuilder.getMany();

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
    }));
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['companies'],
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
      relations: ['companies'],
    });
    return categories.map((c) => ({
      ...c,
      companies:
        c.companies?.map((company) => ({
          id: company.id,
          title: company.title,
        })) || [],
      title: c.title,
    }));
  }

  async findOneForAdmin(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['companies'],
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
    };
  }
} 