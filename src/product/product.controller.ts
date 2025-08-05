import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Query,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  FilesInterceptor,
  AnyFilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

function fileNameEdit(req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, uniqueSuffix + extname(file.originalname));
}

@ApiTags('Product')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // Helper method for formatting file paths
  private formatFilePath(filePath: string): string {
    return filePath
      .replace(/\\/g, '/')
      .replace('public/', '') // public/ prefiksini sil
      .replace(/^\/+/, ''); // Başındakı slash-ları sil
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Product created' })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, './public/uploads/images');
          } else if (file.mimetype === 'application/pdf') {
            cb(null, './public/uploads/pdfs');
          } else {
            cb(new Error('Unsupported file type'), '');
          }
        },
        filename: fileNameEdit,
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.startsWith('image/') ||
          file.mimetype === 'application/pdf'
        ) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async create(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: CreateProductDto,
  ) {
    if (typeof dto.title === 'string') {
      dto.title = JSON.parse(dto.title);
    }
    if (typeof dto.description === 'string') {
      dto.description = JSON.parse(dto.description);
    }
    if (dto.categoryId) {
      dto.categoryId = Number(dto.categoryId);
    }
    if (dto.companyId) {
      dto.companyId = Number(dto.companyId);
    }

    // Məcburi field-ləri yoxla
    if (!dto.categoryId) {
      throw new BadRequestException('categoryId məcburidir');
    }
    if (!dto.companyId) {
      throw new BadRequestException('companyId məcburidir');
    }

    if (files && files.length) {
      dto.imageList = [];
      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          const imagePath = `/${this.formatFilePath(file.path)}`;

          if (!dto.mainImage) {
            dto.mainImage = imagePath;
          }
          dto.imageList.push(imagePath);
        } else if (file.mimetype === 'application/pdf') {
          dto.detailPdf = `/${this.formatFilePath(file.path)}`;
        }
      }
    }

    // imageList her zaman dizi olsun
    if (!dto.imageList || typeof dto.imageList === 'string') {
      dto.imageList = [];
    }

    return this.productService.create(dto);
  }

  // Controller method
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products' })
  @ApiQuery({
    name: 'allLanguages',
    required: false,
    type: Boolean,
    description: 'Return all languages or filtered by accept-language header',
  })
  findAll(
    @Query('allLanguages') allLanguages?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    if (allLanguages === 'true') {
      return this.productService.findAllForAdmin();
    }
    return this.productService.findAll(acceptLanguage);
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
    name: 'company',
    required: false,
    type: String,
    description: 'Filter by company slug',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category slug',
  })
  search(
    @Query('title') title?: string,
    @Query('company') companySlug?: string,
    @Query('category') categorySlug?: string,
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    return this.productService.searchProducts(
      title,
      companySlug,
      categorySlug,
      acceptLanguage,
    );
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
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Product updated' })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          if (file.mimetype.startsWith('image/')) {
            cb(null, './public/uploads/images');
          } else if (file.mimetype === 'application/pdf') {
            cb(null, './public/uploads/pdfs');
          } else {
            cb(new Error('Unsupported file type'), '');
          }
        },
        filename: fileNameEdit,
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.startsWith('image/') ||
          file.mimetype === 'application/pdf'
        ) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async update(
    @Param('id') id: number,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() dto: UpdateProductDto,
  ) {
    if (typeof dto.title === 'string') {
      dto.title = JSON.parse(dto.title);
    }
    if (typeof dto.description === 'string') {
      dto.description = JSON.parse(dto.description);
    }
    if (dto.categoryId) {
      dto.categoryId = Number(dto.categoryId);
    }
    if (dto.companyId) {
      dto.companyId = Number(dto.companyId);
    }

    if (files && files.length) {
      dto.imageList = [];
      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          const imagePath = `/${this.formatFilePath(file.path)}`;

          if (!dto.mainImage) {
            dto.mainImage = imagePath;
          }
          dto.imageList.push(imagePath);
        } else if (file.mimetype === 'application/pdf') {
          dto.detailPdf = `/${this.formatFilePath(file.path)}`;
        }
      }
    }

    // imageList her zaman dizi olsun
    if (!dto.imageList || typeof dto.imageList === 'string') {
      dto.imageList = [];
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
