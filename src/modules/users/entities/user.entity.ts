import { Exclude } from 'class-transformer';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { Dispatch } from 'src/modules/dispatch/entities/dispatch.entity';
import { Voucher } from 'src/modules/dispatch/entities/voucher.entity';
import { Card } from 'src/modules/karthlog/cards/entities/cards.entity';
import { Transaction } from 'src/modules/karthlog/transactions/entities/transactions.entity';
import { Payment } from 'src/modules/payments/entities/payments.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string;

  @Exclude()
  @Column({ length: 100 })
  passwordDigest: string;

  @Exclude()
  @Column({ length: 10, nullable: true })
  OTP: string;

  @Exclude()
  @Column({ nullable: true })
  otpExpiresAt: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  referralId: string;

  @Column({ default: 0, nullable: true })
  referrals: number;

  @Column({
    type: 'enum',
    enum: ['driver', 'consignor', 'consignee', 'admin'],
    default: USER_ROLE.CONSIGNOR,
  })
  role: USER_ROLE;

  @Column({ type: 'decimal', scale: 2, default: 0, nullable: true })
  walletBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Dispatch, (dispatch) => dispatch.user, {
    cascade: true,
    eager: true,
  })
  dispatches: Dispatch[];

  @OneToMany(() => Payment, (payment) => payment.user, {
    cascade: true,
    eager: true,
  })
  payments: Payment[];

  @OneToMany(() => Voucher, (voucher) => voucher.user, {
    cascade: true,
    eager: true,
  })
  vouchers: Voucher[];

  //KARTHLOG USER DETAILS
  @Column({ type: 'decimal', scale: 2, default: 0 })
  cowrieBalance: number;

  @Column({ default: false })
  karthlogStatus: boolean;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Card, (card) => card.users, {
    cascade: true,
  })
  @JoinTable()
  cardsOwned: Card[];

  @OneToMany(() => Transaction, (transaction) => transaction.user, {
    cascade: true,
    eager: true,
  })
  karthlogTransactions: Transaction[];
}

@Entity('waitlisted')
export class Waitlisted {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
