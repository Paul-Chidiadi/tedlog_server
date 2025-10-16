import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NOTIFICATION_TYPE } from '../interfaces/notification.interface';
import { User } from 'src/modules/users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  notificationMessage: string;

  @Column({ type: 'boolean', default: false })
  isSettled: boolean;

  @Column({
    type: 'enum',
    enum: ['PRICE_UPDATE', 'WALLET_BALANCE'],
    default: NOTIFICATION_TYPE.PRICE_UPDATE,
  })
  notificationType: NOTIFICATION_TYPE;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  recipient: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
