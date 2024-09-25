import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { PRODUCT_TYPE } from 'src/common/enums/dispatch.enum';

export class createVoucherDto {
  @IsString()
  @IsNotEmpty()
  voucherName: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsString()
  @IsNotEmpty()
  user: string;
}
