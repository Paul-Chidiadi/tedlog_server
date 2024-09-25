import { Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUserVouchers(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['vouchers'],
    });
  }

  async create(createUser: Partial<User>): Promise<User> {
    const savedResult = await this.userRepository.save(createUser);
    return savedResult;
  }
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['vouchers', 'dispatches'],
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findById(userId: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['vouchers', 'dispatches'],
    });
  }

  async findByEmailAndOtp(
    email: string,
    OTP: string,
  ): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email, OTP } });
  }

  async updateUser(
    payload: Partial<User>,
    email: string,
  ): Promise<UpdateResult> {
    return await this.userRepository.update({ email }, payload);
  }
}
