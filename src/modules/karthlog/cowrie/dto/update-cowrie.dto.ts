import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCowrieRateDto {
  @IsNumber()
  @IsNotEmpty()
  amountPerCowrie: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  currency: string;
}
