import { Exclude } from 'class-transformer';
import { USER_ROLE } from 'src/common/enums/user.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({
    type: 'enum',
    enum: ['driver', 'sender', 'reciever', 'admin'],
    default: USER_ROLE.SENDER,
  })
  role: USER_ROLE;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
