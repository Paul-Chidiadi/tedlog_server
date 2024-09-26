import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
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
import { UpdateDispatchDto } from './dto/update-dispatch.dto';

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

  @Get('getDispatch/:id')
  async getDispatch(@Param('id') id: string, @Res() response) {
    const data = await this.dispatchService.getDispatch(id);
    if (data) {
      return CreateSuccessResponse(response, data, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get Dispatch. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('getAllDisatch')
  async getAllDispatch(@Res() response) {
    const data = await this.dispatchService.getAllDispatch();
    if (data) {
      return CreateSuccessResponse(response, data, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get All Dispatch. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  //ANYONE CAN UPDATE A DISPATCH
  @Patch('updateDispatch/:id')
  async updateDispatch(
    @Body() body: UpdateDispatchDto,
    @Param('id') id: string,
    @Res() response,
  ) {
    const data = await this.dispatchService.updateDispatch(body, id);
    if (data) {
      return CreateSuccessResponse(response, data, 'Update Successful');
    }
    throw new HttpException(
      'Unable to Update Dispatch. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
