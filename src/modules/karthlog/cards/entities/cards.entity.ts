import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { CARD_TYPE } from '../interfaces/cards.interface';
import { Exclude } from 'class-transformer';
import { User } from 'src/modules/users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transactions.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', scale: 2, default: 0, nullable: true })
  cowrieAmount: number;

  @Column({
    type: 'enum',
    enum: ['STANDARD', 'PREMIUM', 'LIMITED'],
    default: CARD_TYPE.STANDARD,
  })
  type: CARD_TYPE;

  @Column({ type: 'text' })
  imageUrl: string;

  @Column({ type: 'json' })
  benefits: string[];

  @Column({ default: 0, nullable: true })
  totalCreated: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Minted, (minted) => minted.card, {
    cascade: true,
  })
  minted: Minted[];

  @OneToMany(() => Transaction, (transaction) => transaction.cardUsed, {
    cascade: true,
  })
  transactions: Transaction[];

  @ManyToMany(() => User, (user) => user.cardsOwned, { onDelete: 'CASCADE' })
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('minted')
export class Minted {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  cardNumber: number;

  @Column({ type: 'text' })
  cardHash: string;

  @Exclude()
  @Column({ type: 'text' })
  unHashedData: string;

  @Column({ default: false })
  isUsed: boolean;

  @ManyToOne(() => Card, (card) => card.minted, { onDelete: 'CASCADE' })
  card: Card;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
