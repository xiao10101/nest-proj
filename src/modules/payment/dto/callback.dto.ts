import { Type } from 'class-transformer';
import { IsInt, IsString, Min } from 'class-validator';

export class PaymentCallbackDto {
  @IsString()
  orderNo: string;

  @IsString()
  channelTradeNo: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  amount: number;
}
