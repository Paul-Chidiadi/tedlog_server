import { IUser } from 'src/modules/users/interfaces/user.interface';

export enum NOTIFICATION_TYPE {
  PRICE_UPDATE = 'PRICE_UPDATE',
  WALLET_BALANCE = 'WALLET_BALANCE',
}

export interface INotification {
  id?: string;
  sender?: IUser;
  recipient?: IUser;
  notificationType?: NOTIFICATION_TYPE;
  notificationMessage?: string;
  isSettled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
