import { TRANSACTION_TYPE } from 'src/common/enums/payment.enum';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Card } from '../../cards/entities/cards.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  email: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['debit', 'credit'],
    default: TRANSACTION_TYPE.CREDIT,
  })
  transactionType: TRANSACTION_TYPE;

  @Column()
  paymentDate: string;

  @Column({ type: 'decimal', scale: 2, default: 0, nullable: true })
  amount: number;

  @ManyToOne(() => User, (user) => user.karthlogTransactions)
  user: User;

  @ManyToOne(() => Card, (card) => card.transactions, { onDelete: 'CASCADE' })
  cardUsed: Card;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
