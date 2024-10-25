import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
import { log } from 'console';

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
  @Get('getAllDispatch')
  async getAllDispatch(@Query() queryParams: any, @Res() response) {
    const data = await this.dispatchService.getAllDispatch(queryParams);
    if (data) {
      return CreateSuccessResponse(response, data, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get All Dispatch. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/getAllDispatch/search')
  async searchDispatches(@Query('query') query: string) {
    const searchDispatch = await this.dispatchService.searchDispatches(query);
    if (searchDispatch) {
      return searchDispatch;
    }
    throw new HttpException(
      'Unable to Search Dispatches. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/getAllDispatch/:userId/search')
  async searchUserDispatches(
    @Param('userId') userId: string,
    @Query('query') query: string,
  ) {
    const searchDispatch = await this.dispatchService.searchUserDispatches(
      userId,
      query,
    );
    if (searchDispatch) {
      return searchDispatch;
    }
    throw new HttpException(
      'No dispatches found for the given user and search query!',
      HttpStatus.NOT_FOUND,
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
