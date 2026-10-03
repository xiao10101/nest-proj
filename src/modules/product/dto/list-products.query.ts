import { ProductStatus } from '@/generated/prisma/client.js';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListProductsQuery {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number;

  @IsString()
  @IsOptional()
  cursor: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;
}
