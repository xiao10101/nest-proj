import {
  IsString,
  IsNumber,
  Length,
  Max,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  city: string;

  @IsString()
  detail?: string;
}

export class DemoDto {
  @IsString()
  @Length(1, 120)
  name: string;

  @IsNumber()
  @Max(150)
  @Min(0)
  age: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}
