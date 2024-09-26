import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { IDispatch } from './interfaces/dispatch.interface';
import { Dispatch } from './entities/dispatch.entity';
import { UsersService } from '../users/users.service';
import { Utilities } from 'src/common/utils/utils.service';
import { DISPATCH_STATUS } from 'src/common/enums/dispatch.enum';
import { Repository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(Dispatch)
    private readonly dispatchRepository: Repository<Dispatch>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,

    private readonly usersService: UsersService,
    private readonly util: Utilities,
  ) {}
  async sendDispatch(
    body: IDispatch,
    currentUser: ICurrentUser,
  ): Promise<Dispatch> {
    const {
      consigneeContact,
      consigneeLocation,
      consigneeName,
      consignorContact,
      consignorLocation,
      consignorName,
      productType,
      weight,
      itemDescription,
      cost,
      voucher,
    } = body;

    const userData = await this.usersService.findById(currentUser.sub);
    const voucherData = await this.voucherRepository.findOneBy({ id: voucher });
    if (!voucherData) {
      throw new HttpException(
        'Invalid Voucher, Please fund your wallet',
        HttpStatus.BAD_REQUEST,
      );
    }

    const usersBalance = Number(userData.walletBalance);
    const voucherValue = Number(voucherData.value);
    if (
      usersBalance >= Number(cost) ||
      (voucher && userData.vouchers.length > 0 && voucherValue >= Number(cost))
    ) {
      const dispatchId = `TEDLOG::${this.util.generateRandomCode(6, false)}`;
      const payload: Partial<Dispatch> = {
        consigneeContact,
        consigneeLocation,
        consigneeName,
        consignorContact,
        consignorLocation,
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
      //Deduct wallet balance if user paid with his wallet
      const walletPayload = {
        walletBalance: usersBalance - Number(cost),
      };
      await this.usersService.updateUser(walletPayload, userData.email);
      return dispatch;
    } else
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

  async getAllDispatch(): Promise<Dispatch[]> {
    const dispatchData = await this.dispatchRepository.find({
      relations: ['user'],
    });
    return dispatchData;
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
