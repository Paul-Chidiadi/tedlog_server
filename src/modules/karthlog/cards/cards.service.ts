import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Card, Minted } from './entities/cards.entity';
import {
  generateRandomString,
  hashString,
} from 'src/common/utils/utils.service';
import { User } from 'src/modules/users/entities/user.entity';
import { Transaction } from '../transactions/entities/transactions.entity';
import * as bcrypt from 'bcrypt';
import { TRANSACTION_TYPE } from 'src/common/enums/payment.enum';
import { ScanCardDto } from './dto/create-card.dto';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    @InjectRepository(Minted)
    private readonly mintedRepository: Repository<Minted>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(createCard: Partial<Card>): Promise<Card> {
    const payload = {
      ...createCard,
    };
    const savedResult = await this.cardRepository.save(payload);
    return savedResult;
  }

  async findAllCards(): Promise<Card[]> {
    return await this.cardRepository.find({
      relations: ['users'],
    });
  }

  async findOne(id: string): Promise<Card> {
    return await this.cardRepository.findOne({
      where: { id: id },
    });
  }

  async updateCard(payload: Partial<Card>, id: string): Promise<UpdateResult> {
    return await this.cardRepository.update({ id: id }, payload);
  }

  async toggleCardStatus(id: string): Promise<UpdateResult> {
    const cardExist = await this.findOne(id);
    const payload = {
      isActive: cardExist.isActive === true ? false : true,
    };
    return await this.cardRepository.update({ id: id }, payload);
  }

  async deleteCard(id: string): Promise<DeleteResult> {
    return await this.cardRepository.delete({ id: id });
  }

  async mintNewCards(id: string, amountToMint: number): Promise<Minted[]> {
    const card = await this.cardRepository.findOne({
      where: { id: id },
      relations: ['minted'],
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const existingMints = card.minted || [];
    const nextCardNumber =
      (existingMints.length > 0
        ? Math.max(...existingMints.map((m) => m.cardNumber))
        : 0) + 1;

    const newMints: Minted[] = [];

    for (let i = 0; i < amountToMint; i++) {
      const cardNumber = nextCardNumber + i;
      const unHashed = generateRandomString(30);
      const hash = await hashString(unHashed);
      const minted = this.mintedRepository.create({
        cardNumber,
        unHashedData: unHashed,
        cardHash: hash,
        card,
      });
      newMints.push(minted);
    }

    return this.mintedRepository.save(newMints);
  }

  async scanCardAndCreditUser(
    { cardNumber, cardHash }: ScanCardDto,
    userId: string,
  ): Promise<string> {
    // 1. Find the card by cardNumber
    const mintedCard = await this.mintedRepository.findOne({
      where: { cardNumber, cardHash },
    });
    if (!mintedCard) {
      throw new NotFoundException('Card Error, Invalid Card');
    }

    // 2. Compare the hashes
    const isMatch = await bcrypt.compare(cardHash, mintedCard.cardHash);
    if (!isMatch) {
      throw new BadRequestException('Invalid card credentials');
    }

    // 3. Fetch the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 4. Credit cowrie balance
    const amountToCredit = Number(mintedCard?.card?.cowrieAmount || 0);
    user.cowrieBalance += amountToCredit;
    await this.userRepository.save(user);

    // Mark the card as used
    await this.mintedRepository.update(
      { cardNumber, cardHash },
      { isUsed: true },
    );

    // 5. Create transaction history
    const transaction = this.transactionRepository.create({
      email: user.email,
      transactionType: TRANSACTION_TYPE.CREDIT,
      paymentDate: new Date().toISOString(),
      amount: amountToCredit,
      user,
      cardUsed: mintedCard?.card,
    });
    await this.transactionRepository.save(transaction);

    return 'Card scanned and cowrie credited successfully';
  }
}
