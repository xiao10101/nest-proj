import { IsString, Length, Matches } from 'class-validator';

export class GetCodeDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string;
}

export class LoginDto {
  @IsString()
  @Matches(/^1[3-9]\d{9}$/)
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
