import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { IDispatch } from './interfaces/dispatch.interface';
import { Dispatch } from './entities/dispatch.entity';
import { UsersService } from '../users/users.service';
import { Utilities } from 'src/common/utils/utils.service';
import { DISPATCH_STATUS } from 'src/common/enums/dispatch.enum';
import { Repository } from 'typeorm';
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
    const usersBalance = userData.walletBalance;
    if (
      usersBalance >= cost ||
      (voucher && userData.vouchers.length > 0 && voucherData.value >= cost)
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
        await this.voucherRepository.remove(voucherData);
        return dispatch;
      }
      return dispatch;
    } else
      throw new HttpException(
        'Insufficeint funds, Please fund your wallet',
        HttpStatus.BAD_REQUEST,
      );
  }
}
