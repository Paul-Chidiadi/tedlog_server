import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from './interfaces/user.interface';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getUser(
    @Param('id') id: string,
    @Query() queryParams: any,
    @Res() response: Response,
  ) {
    const user = await this.usersService.findUserById(id, queryParams);

    if (user) {
      return CreateSuccessResponse(response, user, 'Successful');
    }
    throw new HttpException(
      'No Data Available. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('suspend/:id')
  async suspendUser(@Param('id') id: string, @Res() response: Response) {
    const user = await this.usersService.suspendUser(id);

    if (user) {
      return CreateSuccessResponse(response, user, 'Successful');
    }
    throw new HttpException(
      'Unable to Suspend User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.CONSIGNOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('vouchers')
  async getUserVouchers(
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const userWithVouchers = await this.usersService.findUserVouchers(
      currentUser.sub,
    );
    if (userWithVouchers) {
      return CreateSuccessResponse(
        response,
        userWithVouchers.vouchers,
        'Successful',
      );
    }
    throw new HttpException(
      'Unable to Get User Voucher. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
