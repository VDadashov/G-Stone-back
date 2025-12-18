import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  BadRequestException,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  async create(@Body() dto: CreateProductDto) {
    // Məcburi field-ləri yoxla
    if (!dto.categoryId) {
      throw new BadRequestException('categoryId məcburidir');
    }
    if (!dto.companyId) {
      throw new BadRequestException('companyId məcburidir');
    }

    // imageList her zaman dizi olsun
    if (!dto.imageList || typeof dto.imageList === 'string') {
      dto.imageList = [];
    }

    // Əgər imageList var amma mainImage yoxdursa, ilk image-i mainImage kimi istifadə et
    if (dto.imageList && dto.imageList.length > 0 && !dto.mainImage) {
      dto.mainImage = dto.imageList[0];
    }

    return this.productService.create(dto);
  }

  // Controller method
  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Return all languages or filtered by accept-language header',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'companySlug',
    required: false,
    type: String,
    description: 'Filter by company slug',
  })
  @ApiQuery({
    name: 'categorySlug',
    required: false,
    type: String,
    description: 'Filter by category slug',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['az', 'za', 'newest', 'oldest'],
    description: 'Sıralama növü',
  })
  findAll(
    @Query('allLanguages') allLanguages?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('companySlug') companySlug?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('isActive') isActive?: string,
    @Query('sort') sort?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages === 'true') {
      return this.productService.findAllForAdmin();
    }
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
    return this.productService.findAll(
      acceptLanguage,
      pageNum,
      pageSizeNum,
      companySlug,
      categorySlug,
      isActiveBool,
      sort,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by title, company, or category' })
  @ApiResponse({ status: 200, description: 'Filtered products' })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Search by product title',
  })
  @ApiQuery({
    name: 'companyId',
    required: false,
    type: Number,
    description: 'Filter by company ID',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter by category ID',
  })
  search(
    @Query('title') title?: string,
    @Query('companyId') companyId?: string,
    @Query('categoryId') categoryId?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    const companyIdNum = companyId ? parseInt(companyId, 10) : undefined;
    const categoryIdNum = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.productService.searchProducts(
      title,
      companyIdNum,
      categoryIdNum,
      acceptLanguage,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Return all languages or filtered by accept-language header',
  })
  findBySlug(
    @Param('slug') slug: string,
    @Query('allLanguages') allLanguages?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages === 'true') {
      return this.productService.findBySlugForAdmin(slug);
    }
    return this.productService.findBySlug(slug, acceptLanguage);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by id' })
  @ApiResponse({ status: 200, description: 'Product detail' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Return all languages or filtered by accept-language header',
  })
  findOne(
    @Param('id') id: number,
    @Query('allLanguages') allLanguages?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages === 'true') {
      return this.productService.findOneForAdmin(id);
    }
    return this.productService.findOne(id, acceptLanguage);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated' })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateProductDto,
  ) {
    // imageList her zaman dizi olsun
    if (!dto.imageList || typeof dto.imageList === 'string') {
      dto.imageList = [];
    }

    // Əgər imageList var amma mainImage yoxdursa, ilk image-i mainImage kimi istifadə et
    if (dto.imageList && dto.imageList.length > 0 && !dto.mainImage) {
      dto.mainImage = dto.imageList[0];
    }

    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}
