import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import { Public } from '@/common/decorators/public.decorator.js';
import {
  ListProductsQuery,
  UpdateProductStatusDto,
} from './dto/list-products.query.js';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Public()
  async list(@Query() query: ListProductsQuery) {
    return await this.productService.list(query);
  }

  @Get(':id')
  @Public()
  async get(@Param('id', ParseIntPipe) id: number) {
    return await this.productService.detail(id);
  }

  @Patch(':id')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductStatusDto,
  ) {
    return await this.productService.updateStatus(id, dto.status);
  }
}
