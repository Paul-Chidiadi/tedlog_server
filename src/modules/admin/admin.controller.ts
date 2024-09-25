import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { UsersService } from '../users/users.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { createVoucherDto } from './dto/create-voucher.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('getAllUsers')
  async getAllUsers(@Res() response) {
    const users = await this.usersService.findAll();
    if (users) {
      return CreateSuccessResponse(response, users, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get All User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('createVoucher')
  async createVoucher(@Body() body: createVoucherDto, @Res() response) {
    const voucher = await this.adminService.createVoucher(body);
    if (voucher) {
      return CreateSuccessResponse(
        response,
        voucher,
        'Voucher Created Successfully',
      );
    }
    throw new HttpException(
      'Unable to Create Voucher. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
