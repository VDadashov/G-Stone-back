import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../_common/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { slugify } from '../_common/utils/slugify';
import { Company } from '../_common/entities/company.entity';
import { Category } from '../_common/entities/category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateProductDto) {
    const product = this.productRepo.create(dto);
    product.slug = dto.title && dto.title.az ? slugify(dto.title.az) : '';
    
    // Category məcburidir
    if (!dto.categoryId) {
      throw new BadRequestException('Category ID məcburidir');
    }
    const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Category tapılmadı');
    product.category = category;
    
    // Company məcburidir
    if (!dto.companyId) {
      throw new BadRequestException('Company ID məcburidir');
    }
    const company = await this.companyRepo.findOneBy({ id: dto.companyId });
    if (!company) throw new NotFoundException('Company tapılmadı');
    product.company = company;
    
    return this.productRepo.save(product);
  }

  async findAll(acceptLanguage?: string) {
    let lang = 'az';
    if (acceptLanguage) {
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }
    const products = await this.productRepo.find({ relations: ['company', 'category'] });
    return products.map(product => ({
      ...product,
      title: product.title?.[lang] ?? '',
      description: product.description?.[lang] ?? '',
      company: product.company ? { id: product.company.id, title: product.company.title?.[lang] ?? '' } : null,
      category: product.category ? { id: product.category.id, title: product.category.title?.[lang] ?? '' } : null,
    }));
  }

  async findOne(id: number, acceptLanguage?: string) {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['company', 'category'] });
    if (!product) throw new NotFoundException('Product tapılmadı');
    let lang = 'az';
    if (acceptLanguage) {
      // acceptLanguage formatı: 'en-US,en;q=0.9,az;q=0.8,ru;q=0.7'
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }
    return {
      ...product,
      title: product.title?.[lang] ?? '',
      description: product.description?.[lang] ?? '',
      company: product.company ? { id: product.company.id, title: product.company.title?.[lang] ?? '' } : null,
      category: product.category ? { id: product.category.id, title: product.category.title?.[lang] ?? '' } : null,
    };
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product tapılmadı');
    const oldTitleAz = product.title?.az;
    Object.assign(product, dto);
    if (dto.title && dto.title.az && dto.title.az !== oldTitleAz) {
      product.slug = slugify(dto.title.az);
    }
    
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Category tapılmadı');
      product.category = category;
    }
    
    if (dto.companyId) {
      const company = await this.companyRepo.findOneBy({ id: dto.companyId });
      if (!company) throw new NotFoundException('Company tapılmadı');
      product.company = company;
    }
    return this.productRepo.save(product);
  }

  async remove(id: number) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product tapılmadı');
    await this.productRepo.remove(product);
    return { deleted: true };
  }

  async searchByTitle(title: string, acceptLanguage?: string) {
    let lang = 'az';
    if (acceptLanguage) {
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }
    if (!title) {
      const products = await this.productRepo.find();
      return products.map(product => ({
        ...product,
        title: product.title?.[lang] ?? '',
        description: product.description?.[lang] ?? '',
      }));
    }
    const products = await this.productRepo.createQueryBuilder('product')
      .where("LOWER(product.title::text) LIKE :title", { title: `%${title.toLowerCase()}%` })
      .getMany();
    return products.map(product => ({
      ...product,
      title: product.title?.[lang] ?? '',
      description: product.description?.[lang] ?? '',
    }));
  }

  async findAllForAdmin() {
    const products = await this.productRepo.find({ relations: ['company', 'category'] });
    return products.map(product => ({
      ...product,
      title: product.title, // bütün dillər
      description: product.description, // bütün dillər
      company: product.company ? { id: product.company.id, title: product.company.title } : null,
      category: product.category ? { id: product.category.id, title: product.category.title } : null,
    }));
  }

  async findOneForAdmin(id: number) {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['company', 'category'] });
    if (!product) throw new NotFoundException('Product tapılmadı');
    return {
      ...product,
      title: product.title, // bütün dillər
      description: product.description, // bütün dillər
      company: product.company ? { id: product.company.id, title: product.company.title } : null,
      category: product.category ? { id: product.category.id, title: product.category.title } : null,
    };
  }
} 