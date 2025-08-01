import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  // All properties from CreateProductDto are automatically inherited as optional
  // No need to redeclare them unless you want to override specific behavior
}