import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { CARD_TYPE } from '../interfaces/cards.interface';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  cowrieAmount: number;

  @IsEnum(CARD_TYPE)
  @IsNotEmpty()
  cowrieAmotype: CARD_TYPE;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsArray()
  @IsNotEmpty()
  benefits: string[];
}

export class MintCardsDto {
  @IsString()
  @IsNotEmpty()
  cardId: string;

  @IsNumber()
  @IsNotEmpty()
  amountToMint: number;
}

export class ScanCardDto {
  @IsNumber()
  @IsNotEmpty()
  cardNumber: number;

  @IsString()
  @IsNotEmpty()
  cardHash: string;
}
