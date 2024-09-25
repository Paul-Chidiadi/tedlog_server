import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('voucher')
export class Voucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  voucherName: string;

  @Column({ type: 'decimal', scale: 2, default: 0, nullable: true })
  value: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.vouchers, { onDelete: 'CASCADE' })
  user: User;
}
