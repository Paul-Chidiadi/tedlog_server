import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { envConfig, paystackConfig } from 'src/common/config/env.config';
import axios from 'axios';
import { UsersService } from '../users/users.service';
import { Payment } from './entities/payments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TRANSACTION_TYPE } from 'src/common/enums/payment.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,

    private readonly usersService: UsersService,
  ) {}

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
    const transactionData: Partial<Payment> = {
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
    const usersBalance = Number(user.walletBalance);
    const newBalance =
      transactType === 'credit'
        ? usersBalance + Number(amount)
        : usersBalance - Number(amount);
    const userData = {
      walletBalance: newBalance,
    };
    const paymentData = await this.paymentRepository.save(transactionData);
    //UPDATE USERS WALLET
    const updateUserWallet = await this.usersService.updateUser(
      userData,
      email,
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
