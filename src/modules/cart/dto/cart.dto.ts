import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  skuId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
