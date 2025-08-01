import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { PRODUCT_TYPE } from 'src/common/enums/dispatch.enum';

export class SendDispatchDto {
  @IsString()
  @IsNotEmpty()
  consignorLocation: string;

  @IsString()
  @IsNotEmpty()
  consignorName: string;

  @IsString()
  @IsNotEmpty()
  consignorContact: string;

  @IsString()
  @IsNotEmpty()
  consignorAddress: string;

  @IsString()
  @IsNotEmpty()
  consigneeLocation: string;

  @IsString()
  @IsNotEmpty()
  consigneeName: string;

  @IsString()
  @IsNotEmpty()
  consigneeContact: string;

  @IsString()
  @IsNotEmpty()
  consigneeAddress: string;

  @IsString()
  @IsNotEmpty()
  productType: PRODUCT_TYPE;

  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  @IsString()
  @IsNotEmpty()
  weight: string;

  @IsNumber()
  @IsNotEmpty()
  cost: number;
}
