import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Post('items')
  addItem(
    @CurrentUser() { userId }: { userId: number },
    @Body() { skuId, quantity }: AddCartItemDto,
  ) {
    return this.cartService.addItem(userId, skuId, quantity);
  }

  @Get('items')
  async getItems(@CurrentUser() { userId }: { userId: number }) {
    return await this.cartService.list(userId);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() { userId }: { userId: number },
    @Param('id', ParseIntPipe) id: number,
    @Body() { quantity }: UpdateCartItemDto,
  ) {
    return this.cartService.updateQuantity(userId, id, quantity);
  }

  @Delete('items/:id')
  deleteItem(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() { userId }: { userId: number },
  ) {
    return this.cartService.deleteItem(userId, id);
  }
}
