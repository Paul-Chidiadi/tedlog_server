import { IUser } from 'src/modules/users/interfaces/user.interface';

export enum CARD_TYPE {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  LIMITED = 'LIMITED',
}

export interface IMinted {
  id: string;
  cardNumber: number;
  cardHash: string;
  unHashedData: string;
  isUsed: boolean;
  card: ICard;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard {
  id: string;
  name: string;
  description: string;
  cowrieAmount: number;
  type: CARD_TYPE;
  imageUrl: string;
  benefits: string[];
  totalCreated: number;
  isActive: boolean;
  minted: IMinted[];
  users: IUser[];
  createdAt: Date;
  updatedAt: Date;
}
