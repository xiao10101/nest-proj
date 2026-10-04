import { IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  skuId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}
