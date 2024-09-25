import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(USER_ROLE.ADMIN, USER_ROLE.CONSIGNOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('')
  async getUser(@CurrentUser() currentUser: ICurrentUser, @Res() response) {
    const user = await this.usersService.findById(currentUser.sub);
    if (user) {
      return CreateSuccessResponse(response, user, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN, USER_ROLE.CONSIGNOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('vouchers')
  async getUserVouchers(
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response,
  ) {
    const userWithVouchers = await this.usersService.findUserVouchers(
      currentUser.sub,
    );
    if (userWithVouchers) {
      return CreateSuccessResponse(
        response,
        userWithVouchers.vouchers,
        'Successfull',
      );
    }
    throw new HttpException(
      'Unable to Get User Voucher. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
