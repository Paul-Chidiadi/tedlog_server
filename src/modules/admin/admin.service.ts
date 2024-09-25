import { Injectable } from '@nestjs/common';
import { Voucher } from '../dispatch/entities/voucher.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from '../users/users.service';
import { IVoucher } from './interfaces/admin.interface';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,

    private readonly usersService: UsersService,
  ) {}

  async createVoucher(body: Partial<IVoucher>): Promise<Voucher> {
    const user = await this.usersService.findById(body.user);
    const payload: Partial<Voucher> = {
      voucherName: body.voucherName,
      value: body.value,
      user: user,
    };
    const voucher = await this.voucherRepository.save(payload);
    return voucher;
  }
}
