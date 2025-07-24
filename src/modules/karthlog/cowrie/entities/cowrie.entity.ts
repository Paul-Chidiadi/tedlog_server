import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cowrie')
export class Cowrie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', scale: 2, default: 0, nullable: true })
  amountPerCowrie: number;

  @Column({ type: 'text' })
  currency: string;

  @Column({ default: false })
  isCreated: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('cowrieHistory')
export class CowrieHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', scale: 2, default: 0, nullable: true })
  rate: number;

  @Column({ type: 'text', nullable: true })
  emailOfSetter: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
