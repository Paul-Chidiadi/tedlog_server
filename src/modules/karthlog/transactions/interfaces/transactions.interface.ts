import { TRANSACTION_TYPE } from 'src/common/enums/payment.enum';
import { IUser } from 'src/modules/users/interfaces/user.interface';
import { ICard } from '../../cards/interfaces/cards.interface';

export interface ITransaction {
  id: string;
  email: string;
  transactionType: TRANSACTION_TYPE;
  paymentDate: string;
  amount: number;
  user: IUser;
  cardUsed: ICard;
  createdAt: Date;
  updatedAt: Date;
}
