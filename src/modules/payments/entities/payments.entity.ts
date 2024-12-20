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

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  email: string;

  @Column()
  transactionId: string;

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

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
