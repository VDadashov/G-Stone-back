import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Company } from '../_common/entities/company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { slugify } from '../_common/utils/slugify';
import { I18nService } from '../i18n/i18n.service';
import { Category } from '../_common/entities/category.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly i18n: I18nService,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly configService: ConfigService,
  ) {}

  private getFullImageUrl(logoPath: string): string | null {
    if (!logoPath) return null;
    const baseUrl = this.configService.get<string>('BASE_URL');
    return `${baseUrl}${logoPath}`;
  }

  async create(dto: CreateCompanyDto, logo?: any) {
    const company = this.companyRepo.create(dto);
    company.slug = dto.title && dto.title.az ? slugify(dto.title.az) : '';
    if (logo) {
      company.logo = `/uploads/images/${logo.filename}`;
    }
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.categoryRepo.findByIds(dto.categoryIds);
      if (categories.length !== dto.categoryIds.length)
        throw new NotFoundException('Bəzi category id-lər tapılmadı');
      company.categories = categories;
    }

    const savedCompany = await this.companyRepo.save(company);

    return {
      ...savedCompany,
      logo: this.getFullImageUrl(savedCompany.logo),
    };
  }

  async findAll(lang?: string) {
    lang = lang || 'az';
    const companies = await this.companyRepo.find({
      relations: ['categories'],
    });

    return companies.map((c) => {
      return {
        ...c,
        logo: this.getFullImageUrl(c.logo),
        categories:
          c.categories?.map((category) => ({
            id: category.id,
            title: this.i18n.translateField(category.title, lang),
          })) || [],
        title: this.i18n.translateField(c.title, lang),
        description: this.i18n.translateField(c.description, lang),
        altText: this.i18n.translateField(c.altText, lang),
      };
    });
  }

  async findOne(id: number, lang?: string) {
    lang = lang || 'az';
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!company) throw new NotFoundException('Company not found');

    return {
      ...company,
      logo: this.getFullImageUrl(company.logo),
      categories: company.categories?.map((category) => category.id) || [],
      title: this.i18n.translateField(company.title, lang),
      description: this.i18n.translateField(company.description, lang),
      altText: this.i18n.translateField(company.altText, lang),
    };
  }

  async update(id: number, dto: UpdateCompanyDto, logo?: any) {
    const company = await this.companyRepo.findOneBy({ id });
    if (!company) throw new NotFoundException('Company not found');
    const oldTitleAz = company.title?.az;
    Object.assign(company, dto);
    if (dto.title && dto.title.az && dto.title.az !== oldTitleAz) {
      company.slug = slugify(dto.title.az);
    }
    if (logo) {
      company.logo = `/uploads/images/${logo.filename}`;
    }
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.categoryRepo.findByIds(dto.categoryIds);
      if (categories.length !== dto.categoryIds.length)
        throw new NotFoundException('Bəzi category id-lər tapılmadı');
      company.categories = categories;
    }

    const savedCompany = await this.companyRepo.save(company);

    return {
      ...savedCompany,
      logo: this.getFullImageUrl(savedCompany.logo),
    };
  }

  async remove(id: number) {
    const company = await this.companyRepo.findOneBy({ id });
    if (!company) throw new NotFoundException('Company not found');
    await this.companyRepo.remove(company);
    return { deleted: true };
  }

  async uploadLogo(id: number, file: Express.Multer.File) {
    const company = await this.companyRepo.findOneBy({ id });
    if (!company) throw new NotFoundException('Company not found');
    company.logo = `/uploads/images/${file.filename}`;
    await this.companyRepo.save(company);
    return {
      logo: this.getFullImageUrl(company.logo),
    };
  }

  async findAllForAdmin() {
    const companies = await this.companyRepo.find({
      relations: ['categories'],
    });
    return companies.map((c) => ({
      ...c,
      logo: this.getFullImageUrl(c.logo),
      categories:
        c.categories?.map((category) => ({
          id: category.id,
          title: category.title, // bütün dillər
        })) || [],
      title: c.title, // bütün dillər
      description: c.description, // bütün dillər
      altText: c.altText, // bütün dillər
    }));
  }

  async findOneForAdmin(id: number) {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['categories'],
    });
    if (!company) throw new NotFoundException('Company not found');
    return {
      ...company,
      logo: this.getFullImageUrl(company.logo),
      categories:
        company.categories?.map((category) => ({
          id: category.id,
          title: category.title, // bütün dillər
        })) || [],
      title: company.title, // bütün dillər
      description: company.description, // bütün dillər
      altText: company.altText, // bütün dillər
    };
  }
}
