import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { SendDispatchDto } from './dto/send-dispatch.dto';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from '../users/interfaces/user.interface';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Roles(USER_ROLE.ADMIN, USER_ROLE.CONSIGNOR)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('sendDispatch')
  async sendDispatch(
    @Body() body: SendDispatchDto,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response,
  ) {
    const data = await this.dispatchService.sendDispatch(body, currentUser);
    if (data) {
      return CreateSuccessResponse(response, data, 'Send Dispatch successful');
    }
    throw new HttpException(
      'Unable to Send Dispatch. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
