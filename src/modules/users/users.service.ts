import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ICurrentUser } from './interfaces/user.interface';

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
      relations: [
        'vouchers',
        'dispatches',
        'cardsOwned',
        'karthlogTransactions',
      ],
    });
  }

  async searchUsers(searchString: string): Promise<User[]> {
    const searchRegex = `%${searchString}%`; // SQL LIKE pattern for partial matching
    const searchUser = await this.userRepository
      .createQueryBuilder('users')
      .where('users.name LIKE :searchRegex', { searchRegex })
      .orWhere('users.email LIKE :searchRegex', {
        searchRegex,
      })
      .orWhere('users.phoneNumber LIKE :searchRegex', {
        searchRegex,
      })
      .orWhere('users.referralId LIKE :searchRegex', { searchRegex })
      .orWhere('users.walletBalance LIKE :searchRegex', { searchRegex })
      .getMany();
    return searchUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByReferralId(referralId: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { referralId } });
  }

  async findById(userId: string): Promise<User | undefined> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['vouchers', 'dispatches'],
    });
  }

  async findUserById(
    userId: string,
    queryParams: any,
  ): Promise<Partial<User> | undefined> {
    // Create the base query to fetch the user with related vouchers and dispatches
    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.vouchers', 'vouchers')
      .leftJoinAndSelect('users.payments', 'payments')
      .leftJoinAndSelect('users.dispatches', 'dispatches')
      .leftJoinAndSelect('users.karthlogTransactions', 'karthlogTransactions')
      .leftJoinAndSelect('users.cardsOwned', 'cardsOwned');

    // Filter the user by their ID
    queryBuilder.where('users.id = :userId', { userId });

    // Apply filters on dispatches based on queryParams
    if (queryParams.status) {
      // Check if the dispatches relation exists before applying the status filter
      queryBuilder.andWhere(
        '(dispatches.status = :status OR dispatches.id IS NULL)',
        { status: queryParams.status },
      );
    }

    // Fetch the user with the applied filters
    const result = await queryBuilder.getOne();
    const { passwordDigest, OTP, otpExpiresAt, ...userData } = result;

    return userData;
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

  async claimReward(currentUser: ICurrentUser): Promise<UpdateResult> {
    const userEmail = currentUser.email;
    const user = await this.findByEmail(userEmail);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload: Partial<User> = {
      streakCount: user.streakCount + 1,
      totalShellsEarned: user.totalShellsEarned + 5,
    };

    return await this.userRepository.update({ email: userEmail }, payload);
  }

  async suspendUser(id: string): Promise<UpdateResult> {
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new BadRequestException('User not found');
    }
    return await this.userRepository.update(
      { id: id },
      { isActive: existingUser.isActive ? false : true },
    );
  }
}
