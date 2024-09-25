import { DISPATCH_STATUS, PRODUCT_TYPE } from 'src/common/enums/dispatch.enum';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('dispatches')
export class Dispatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  dispatchId: string;

  @Column({ type: 'datetime', nullable: true })
  dateDelivered: Date;

  @Column({ type: 'datetime', nullable: true })
  dateRecieved: Date;

  @Column({ length: 200 })
  consignorLocation: string;

  @Column({ length: 50 })
  consignorName: string;

  @Column({ length: 50 })
  consignorContact: string;

  @Column({ length: 200 })
  consigneeLocation: string;

  @Column({ length: 50 })
  consigneeName: string;

  @Column({ length: 50 })
  consigneeContact: string;

  @Column({
    type: 'enum',
    enum: [
      'perishable',
      'fragile',
      'bulky',
      'liquid',
      'dangerous',
      'document',
      'livestock',
      'electronic',
      'clothing',
      'medical',
      'miscellaneous',
    ],
    default: PRODUCT_TYPE.MISC,
  })
  productType: PRODUCT_TYPE;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed'],
    default: DISPATCH_STATUS.PENDING,
  })
  status: DISPATCH_STATUS;

  @Column({ type: 'text' })
  itemDescription: string;

  @Column()
  weight: string;

  @Column({ type: 'decimal', scale: 2, default: 0 })
  cost: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.dispatches, { onDelete: 'CASCADE' })
  user: User;
}
