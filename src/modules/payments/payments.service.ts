import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { envConfig, paystackConfig } from 'src/common/config/env.config';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { Payment } from './entities/payments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TRANSACTION_TYPE } from 'src/common/enums/payment.enum';
import { convertNairaToCowrie } from 'src/common/utils/utils.service';
import { CowrieService } from '../karthlog/cowrie/cowrie.service';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPE } from '../notifications/interfaces/notification.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly usersService: UsersService,
    private readonly cowrieService: CowrieService,

    private notificationService: NotificationsService,
  ) {}

  async getAllPayments(): Promise<Payment[]> {
    const paymentsData = await this.paymentRepository.find();
    return paymentsData;
  }

  async initializePayment(
    email: string,
    amount: number,
    metadata?: { userId: string },
  ) {
    try {
      const response = await axios.post(
        `${paystackConfig.PAYSTACK_BASE_URL}/transaction/initialize`,
        {
          email,
          amount: amount * 100, // Amount should be in kobo (100 Naira = 10000 kobo)
          metadata,
          callback_url:
            process.env.NODE_ENV === 'development'
              ? `${envConfig.LOCAL_URL}/sender/wallet`
              : `${envConfig.CLIENT_URL}/sender/wallet`,
        },
        {
          headers: {
            Authorization: `Bearer ${paystackConfig.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        status: 'success',
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference,
      };
    } catch (error) {
      throw new HttpException(
        `${error}Payment initialization failed`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateTransactionData(payload: any): Promise<Payment> {
    const { amount, email, transactionId, paymentDate, transactType } = payload;
    const user = await this.usersService.findByEmail(email);

    const transactionDataPayload: Partial<Payment> = {
      email,
      transactionId,
      transactionType:
        transactType === 'credit'
          ? TRANSACTION_TYPE.CREDIT
          : TRANSACTION_TYPE.DEBIT,
      paymentDate,
      amount,
      user,
    };

    // GET COWRIE RATE
    const cowrieData = await this.cowrieService.getCowrieRate();
    const cowrieEquivalent = convertNairaToCowrie(
      Number(amount),
      Number(cowrieData?.amountPerCowrie),
    );
    const usersCowrieBalance = Number(user.cowrieBalance);

    const newBalance =
      transactType === 'credit'
        ? usersCowrieBalance + Number(cowrieEquivalent)
        : usersCowrieBalance;

    const userDataPayload: Partial<User> = {
      cowrieBalance: newBalance,
    };
    //UPDATE USERS WALLET
    const updateUserWallet =
      transactType === 'credit' &&
      (await this.usersService.updateUser(userDataPayload, email));

    if (updateUserWallet) {
      await this.notificationService.create({
        recipient: user,
        notificationMessage: `Your wallet has been credited with ${amount}`,
        notificationType: NOTIFICATION_TYPE.WALLET_BALANCE,
      });
    }

    const paymentData = await this.paymentRepository.save(
      transactionDataPayload,
    );
    return paymentData;
  }

  // Method to verify payment using Paystack's transaction verification endpoint
  async verifyPayment(reference: string) {
    try {
      const response = await axios.get(
        `${paystackConfig.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackConfig.PAYSTACK_SECRET_KEY}`,
          },
        },
      );
      return response.data.data;
    } catch (error) {
      throw new HttpException(
        'Payment verification failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
