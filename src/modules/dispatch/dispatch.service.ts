import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { IDispatch } from './interfaces/dispatch.interface';
import { Dispatch } from './entities/dispatch.entity';
import { UsersService } from '../users/users.service';
import { Utilities, getDateString } from 'src/common/utils/utils.service';
import { DISPATCH_STATUS } from 'src/common/enums/dispatch.enum';
import { Brackets, Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Dispatch)
    private readonly dispatchRepository: Repository<Dispatch>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,

    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly util: Utilities,
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
      voucher,
    } = body;

    const userData = await this.usersService.findById(currentUser.sub);
    const voucherData = await this.voucherRepository.findOneBy({ id: voucher });
    if (voucher && !voucherData) {
      throw new HttpException('Invalid Voucher', HttpStatus.BAD_REQUEST);
    }

    const usersBalance = Number(userData.walletBalance);
    const voucherValue = voucher ? Number(voucherData.value) : 0;
    //ADD VOUCHER VALUE TO SEE IF IT CAN REACH
    const balancePlusVoucher = usersBalance + voucherValue;

    if (balancePlusVoucher >= Number(cost)) {
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
      if (dispatch && voucher) {
        //remove voucher if user paid with his voucher
        await this.voucherRepository.remove(voucherData);
        return dispatch;
      }

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

      const walletPayload = {
        walletBalance: voucher
          ? usersBalance - (Number(cost) - Number(voucherData.value))
          : usersBalance - Number(cost),
      };
      await this.usersService.updateUser(walletPayload, userData.email);
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
