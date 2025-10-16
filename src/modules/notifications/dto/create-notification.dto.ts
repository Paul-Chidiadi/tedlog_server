import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { NOTIFICATION_TYPE } from '../interfaces/notification.interface';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  notificationMessage: string;

  @IsString()
  @IsNotEmpty()
  status: NOTIFICATION_TYPE;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  senderId?: string;

  @IsString()
  @IsNotEmpty()
  recipientId?: string;
}
