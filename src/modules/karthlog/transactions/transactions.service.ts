import { Injectable } from '@nestjs/common';
import { Transaction } from './entities/transactions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICurrentUser } from 'src/modules/users/interfaces/user.interface';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(createTransaction: Partial<Transaction>): Promise<Transaction> {
    const savedResult =
      await this.transactionRepository.save(createTransaction);
    return savedResult;
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      relations: ['user', 'cardUsed'],
    });
  }

  async findUsersTransactions(
    currentUser: ICurrentUser,
  ): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: { user: { id: currentUser.sub } },
      relations: ['cardUsed'],
    });
  }
}
