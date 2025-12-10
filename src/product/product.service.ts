import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../_common/entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { slugify } from '../_common/utils/slugify';
import { Company } from '../_common/entities/company.entity';
import { Category } from '../_common/entities/category.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    private configService: ConfigService,
  ) {}

  private getFullImageUrl(imagePath: string | null | undefined): string | null {
    if (!imagePath || imagePath === '' || typeof imagePath !== 'string') {
      return null;
    }
    
    // Trim whitespace
    const trimmedPath = imagePath.trim();
    if (!trimmedPath) return null;
    
    // Əgər artıq tam URL-dirsə (http:// və ya https:// ilə başlayırsa), olduğu kimi qaytar
    if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://')) {
      return trimmedPath;
    }
    
    // Base URL-i əlavə et (yalnız relative path üçün)
    const baseUrl = this.configService.get<string>('BASE_URL');
    if (!baseUrl) {
      return trimmedPath;
    }
    
    // Əgər path artıq baseUrl ilə başlayırsa, baseUrl-i əlavə etmə
    if (trimmedPath.startsWith(baseUrl)) {
      return trimmedPath;
    }
    
    return `${baseUrl}${trimmedPath}`;
  }

  private transformProductImages(product: any) {
    return {
      ...product,
      mainImage: this.getFullImageUrl(product.mainImage),
      imageList:
        product.imageList
          ?.map((img) => this.getFullImageUrl(img))
          .filter(Boolean) || [],
      detailPdf: this.getFullImageUrl(product.detailPdf),
    };
  }

  private transformImageUrl(imagePath: string): string {
    if (!imagePath) return '';

    // Əgər artıq tam URL-dirsə, olduğu kimi qaytar
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Base URL-i əlavə et
    const baseUrl =
      process.env.BASE_URL || 'https://g-stone-back-production.up.railway.app';
    return `${baseUrl}${imagePath}`;
  }

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

    const savedProduct = await this.productRepo.save(product);

    // URL'ləri tam halına gətir
    return this.transformProductImages(savedProduct);
  }

  async findAll(
    acceptLanguage?: string,
    page?: number,
    pageSize?: number,
    companyId?: number,
    categoryId?: number,
    isActive?: boolean,
    sort?: string,
  ) {
    const currentPage = page || 1;
    const limit = pageSize || 10;
    const offset = (currentPage - 1) * limit;

    let lang = 'az';
    if (acceptLanguage) {
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('product.category', 'category');

    // Company ID filter (optional)
    if (companyId) {
      queryBuilder.andWhere('company.id = :companyId', { companyId });
    }

    // Category ID filter (optional)
    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    // Active status filter (optional)
    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    // Sort
    switch (sort) {
      case 'az':
        // A-Z sıralaması üçün sadə yanaşma
        queryBuilder.orderBy('product.id', 'ASC');
        break;
      case 'za':
        // Z-A sıralaması üçün sadə yanaşma
        queryBuilder.orderBy('product.id', 'DESC');
        break;
      case 'newest':
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
      case 'oldest':
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;
      default:
        queryBuilder.orderBy('product.id', 'DESC');
    }

    // Get total count before pagination
    const totalItems = await queryBuilder.getCount();

    // Apply pagination and get products
    const products = await queryBuilder
      .skip(offset)
      .take(limit)
      .getMany();

    const data = products.map((product) => {
      const transformedProduct = this.transformProductImages(product);
      return {
        ...transformedProduct,
        title: product.title?.[lang] ?? '',
        description: product.description?.[lang] ?? '',
        company: product.company
          ? {
              id: product.company.id,
              title: product.company.title?.[lang] ?? '',
            }
          : null,
        category: product.category
          ? {
              id: product.category.id,
              title: product.category.title?.[lang] ?? '',
            }
          : null,
      };
    });

    return {
      data,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage,
        pageSize: limit,
      },
    };
  }

  async findOne(id: number, acceptLanguage?: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['company', 'category'],
    });
    if (!product) throw new NotFoundException('Product tapılmadı');
    let lang = 'az';
    if (acceptLanguage) {
      // acceptLanguage formatı: 'en-US,en;q=0.9,az;q=0.8,ru;q=0.7'
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }

    const transformedProduct = this.transformProductImages(product);
    return {
      ...transformedProduct,
      title: product.title?.[lang] ?? '',
      description: product.description?.[lang] ?? '',
      company: product.company
        ? { id: product.company.id, title: product.company.title?.[lang] ?? '' }
        : null,
      category: product.category
        ? {
            id: product.category.id,
            title: product.category.title?.[lang] ?? '',
          }
        : null,
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
      const category = await this.categoryRepo.findOneBy({
        id: dto.categoryId,
      });
      if (!category) throw new NotFoundException('Category tapılmadı');
      product.category = category;
    }

    if (dto.companyId) {
      const company = await this.companyRepo.findOneBy({ id: dto.companyId });
      if (!company) throw new NotFoundException('Company tapılmadı');
      product.company = company;
    }

    const savedProduct = await this.productRepo.save(product);
    return this.transformProductImages(savedProduct);
  }

  async remove(id: number) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException('Product tapılmadı');
    await this.productRepo.remove(product);
    return { deleted: true };
  }

  async searchProducts(
    title?: string,
    companyId?: number,
    categoryId?: number,
    acceptLanguage?: string,
  ) {
    let lang = 'az';
    if (acceptLanguage) {
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('product.category', 'category');

    let hasConditions = false;

    // Title filter (optional)
    if (title && title.trim()) {
      queryBuilder.where('LOWER(product.title::text) LIKE :title', {
        title: `%${title.toLowerCase()}%`,
      });
      hasConditions = true;
    }

    // Company ID filter (optional)
    if (companyId) {
      if (hasConditions) {
        queryBuilder.andWhere('company.id = :companyId', { companyId });
      } else {
        queryBuilder.where('company.id = :companyId', { companyId });
        hasConditions = true;
      }
    }

    // Category ID filter (optional)
    if (categoryId) {
      if (hasConditions) {
        queryBuilder.andWhere('category.id = :categoryId', { categoryId });
      } else {
        queryBuilder.where('category.id = :categoryId', { categoryId });
        hasConditions = true;
      }
    }

    const products = await queryBuilder.getMany();

    return products.map((product) => {
      const transformedProduct = this.transformProductImages(product);

      // Transform company logo URL if company exists
      if (product.company && product.company.logo) {
        product.company.logo = this.transformImageUrl(product.company.logo);
      }

      return {
        ...transformedProduct,
        title: product.title?.[lang] ?? '',
        description: product.description?.[lang] ?? '',
        company: product.company
          ? {
              ...product.company,
              title: product.company.title?.[lang] ?? '',
              description: product.company.description?.[lang] ?? '',
              altText: product.company.altText?.[lang] ?? '',
            }
          : null,
      };
    });
  }

  async findAllForAdmin() {
    const products = await this.productRepo.find({
      relations: ['company', 'category'],
    });
    return products.map((product) => {
      const transformedProduct = this.transformProductImages(product);
      return {
        ...transformedProduct,
        title: product.title, // bütün dillər
        description: product.description, // bütün dillər
        company: product.company
          ? { id: product.company.id, title: product.company.title }
          : null,
        category: product.category
          ? { id: product.category.id, title: product.category.title }
          : null,
      };
    });
  }

  async findOneForAdmin(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['company', 'category'],
    });
    if (!product) throw new NotFoundException('Product tapılmadı');

    const transformedProduct = this.transformProductImages(product);
    return {
      ...transformedProduct,
      title: product.title, // bütün dillər
      description: product.description, // bütün dillər
      company: product.company
        ? { id: product.company.id, title: product.company.title }
        : null,
      category: product.category
        ? { id: product.category.id, title: product.category.title }
        : null,
    };
  }

  async findBySlug(slug: string, acceptLanguage?: string) {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: ['company', 'category'],
    });
    if (!product) throw new NotFoundException('Product tapılmadı');
    
    let lang = 'az';
    if (acceptLanguage) {
      lang = acceptLanguage.split(',')[0].split('-')[0];
    }

    const transformedProduct = this.transformProductImages(product);
    return {
      ...transformedProduct,
      title: product.title?.[lang] ?? '',
      description: product.description?.[lang] ?? '',
      company: product.company
        ? { id: product.company.id, title: product.company.title?.[lang] ?? '' }
        : null,
      category: product.category
        ? {
            id: product.category.id,
            title: product.category.title?.[lang] ?? '',
          }
        : null,
    };
  }

  async findBySlugForAdmin(slug: string) {
    const product = await this.productRepo.findOne({
      where: { slug },
      relations: ['company', 'category'],
    });
    if (!product) throw new NotFoundException('Product tapılmadı');

    const transformedProduct = this.transformProductImages(product);
    return {
      ...transformedProduct,
      title: product.title, // bütün dillər
      description: product.description, // bütün dillər
      company: product.company
        ? { id: product.company.id, title: product.company.title }
        : null,
      category: product.category
        ? { id: product.category.id, title: product.category.title }
        : null,
    };
  }
}
