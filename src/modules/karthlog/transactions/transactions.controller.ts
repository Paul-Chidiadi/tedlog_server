import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { ICurrentUser } from 'src/modules/users/interfaces/user.interface';
import { Response } from 'express';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('karthlog/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @UseGuards(AuthGuard)
  @Get('user')
  async getUserTransactions(
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const data =
      await this.transactionsService.findUsersTransactions(currentUser);
    if (data) {
      return CreateSuccessResponse(response, data, 'Successful');
    }
    throw new HttpException(
      'Unable to Get Users Transactions. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('user/all')
  async getAllTransactions(@Res() response: Response) {
    const data = await this.transactionsService.findAll();
    if (data) {
      return CreateSuccessResponse(response, data, 'Successful');
    }
    throw new HttpException(
      'Unable to Get Users Transactions. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
