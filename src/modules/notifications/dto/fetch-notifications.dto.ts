import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class FetchNotificationsDto {
  @IsNumberString()
  page?: number;

  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search?: string;
}
