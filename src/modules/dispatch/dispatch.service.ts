import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { IDispatch } from './interfaces/dispatch.interface';
import { Dispatch } from './entities/dispatch.entity';
import { UsersService } from '../users/users.service';
import {
  Utilities,
  convertNairaToCowrie,
  getDateString,
} from 'src/common/utils/utils.service';
import { DISPATCH_STATUS } from 'src/common/enums/dispatch.enum';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { PaymentsService } from '../payments/payments.service';
import { CowrieService } from '../karthlog/cowrie/cowrie.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPE } from '../notifications/interfaces/notification.interface';
import { EmailService } from 'src/common/utils/email.service';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Dispatch)
    private readonly dispatchRepository: Repository<Dispatch>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,

    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly cowrieService: CowrieService,
    private readonly util: Utilities,
    private readonly emailService: EmailService,

    private notificationService: NotificationsService,
  ) {}

  async sendDispatch(
    body: IDispatch,
    currentUser: ICurrentUser,
  ): Promise<Dispatch> {
    const {
      consigneeContact,
      consigneeLocation,
      consigneeAddress,
      consigneeName,
      consignorContact,
      consignorLocation,
      consignorAddress,
      consignorName,
      productType,
      weight,
      itemDescription,
      cost,
    } = body;

    const userData = await this.usersService.findById(currentUser.sub);
    const usersCowrieBalance = Number(userData.cowrieBalance);

    // CONVERT COST IN NARIA TO COWRIE
    // GET COWRIE RATE
    const cowrieData = await this.cowrieService.getCowrieRate();
    const cowrieEquivalent = convertNairaToCowrie(
      Number(cost),
      Number(cowrieData?.amountPerCowrie),
    );

    if (usersCowrieBalance >= Number(cowrieEquivalent)) {
      const dispatchId = `TEDLOG::${this.util.generateRandomCode(6, false)}`;
      const payload: Partial<Dispatch> = {
        consigneeContact,
        consigneeLocation,
        consigneeAddress,
        consigneeName,
        consignorContact,
        consignorLocation,
        consignorAddress,
        consignorName,
        productType,
        weight,
        itemDescription,
        cost,
        user: userData,
        dispatchId,
        status: DISPATCH_STATUS.PENDING,
      };
      const dispatch = await this.dispatchRepository.save(payload);

      //Deduct/update wallet balance if user paid with his wallet
      const payloadUpdate: any = {
        amount: cost,
        email: userData.email,
        transactionId: dispatchId,
        paymentDate: getDateString(),
        transactType: 'debit',
      };

      const transactUpdate =
        await this.paymentsService.updateTransactionData(payloadUpdate);

      const userWalletPayload = {
        cowrieBalance: Number(usersCowrieBalance) - Number(cowrieEquivalent),
      };

      //UPDATE USERS WALLET
      const updateUserWallet = await this.usersService.updateUser(
        userWalletPayload,
        userData.email,
      );

      const sendMail = await this.emailService.sendDeliveryTracking(
        userData.email,
        userData.name.split(' ')[0],
        {
          trackingId: dispatch.dispatchId,
          pickupPoint: consignorLocation,
          expectedDelivery: dispatch.productType,
        },
      );

      if (updateUserWallet) {
        await this.notificationService.create({
          recipient: userData,
          notificationMessage: `Your wallet has been debited with ${cost}`,
          notificationType: NOTIFICATION_TYPE.WALLET_BALANCE,
        });
      }
      return dispatch;
    }

    throw new HttpException(
      'Insufficeint funds, Please fund your wallet',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getDispatch(id: string): Promise<Dispatch> {
    const dispatchData = await this.dispatchRepository.findOne({
      where: { dispatchId: id },
      relations: ['user'],
    });
    return dispatchData;
  }

  async getAllDispatch(queryParams: any): Promise<Dispatch[]> {
    const queryBuilder = this.dispatchRepository
      .createQueryBuilder('dispatches')
      .leftJoinAndSelect('dispatches.user', 'user');
    // Dynamically add filters based on the presence of query parameters
    if (queryParams.status) {
      queryBuilder.andWhere('dispatches.status = :status', {
        status: queryParams.status,
      });
    }
    // If no filters are applied, this will return all dispatches
    return queryBuilder.getMany();
  }

  async searchDispatches(searchString: string): Promise<Dispatch[]> {
    const searchRegex = `%${searchString}%`; // SQL LIKE pattern for partial matching
    const searchDispatch = await this.dispatchRepository
      .createQueryBuilder('dispatches')
      .where('dispatches.dispatchId LIKE :searchRegex', { searchRegex })
      .orWhere('dispatches.consignorLocation LIKE :searchRegex', {
        searchRegex,
      })
      .orWhere('dispatches.consigneeLocation LIKE :searchRegex', {
        searchRegex,
      })
      .orWhere('dispatches.consigneeName LIKE :searchRegex', { searchRegex })
      .orWhere('dispatches.consignorName LIKE :searchRegex', { searchRegex })
      .orWhere('dispatches.dateDelivered LIKE :searchRegex', {
        searchRegex,
      })
      .orWhere('dispatches.productType LIKE :searchRegex', { searchRegex })
      .getMany();
    return searchDispatch;
  }

  async searchUserDispatches(
    userId: string,
    searchString: string,
  ): Promise<Dispatch[]> {
    const searchRegex = `%${searchString}%`; // SQL LIKE pattern for partial matching

    // Create the query to filter dispatches by user and apply the search string
    const searchDispatch = await this.dispatchRepository
      .createQueryBuilder('dispatches')
      .leftJoinAndSelect('dispatches.user', 'user') // Join the user relation
      .where('user.id = :userId', { userId }) // Filter by userId
      .andWhere(
        new Brackets((qb) => {
          qb.where('dispatches.dispatchId LIKE :searchRegex', { searchRegex })
            .orWhere('dispatches.consignorLocation LIKE :searchRegex', {
              searchRegex,
            })
            .orWhere('dispatches.consigneeLocation LIKE :searchRegex', {
              searchRegex,
            })
            .orWhere('dispatches.consigneeName LIKE :searchRegex', {
              searchRegex,
            })
            .orWhere('dispatches.consignorName LIKE :searchRegex', {
              searchRegex,
            })
            .orWhere('dispatches.dateDelivered LIKE :searchRegex', {
              searchRegex,
            })
            .orWhere('dispatches.productType LIKE :searchRegex', {
              searchRegex,
            });
        }),
      )
      .getMany();

    return searchDispatch;
  }

  async updateDispatch(
    body: Partial<IDispatch>,
    id: string,
  ): Promise<UpdateResult> {
    const { status } = body;
    const payload: Partial<IDispatch> =
      status === DISPATCH_STATUS.COMPLETED
        ? { status: status, dateRecieved: new Date() }
        : status === DISPATCH_STATUS.STARTED
          ? { status: status, dateDelivered: new Date() }
          : { status: status };
    const result = await this.dispatchRepository.update(
      { dispatchId: id },
      payload,
    );
    return result;
  }
}
