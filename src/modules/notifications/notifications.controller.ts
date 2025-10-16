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
import { NotificationsService } from './notifications.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { FetchNotificationsDto } from './dto/fetch-notifications.dto';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { Response } from 'express';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAllForAUser(
    @Query() fetchNotificationsDto: FetchNotificationsDto,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const result = await this.notificationsService.findAllForAUser(
      currentUser,
      fetchNotificationsDto,
    );
    if (result) {
      return CreateSuccessResponse(response, result, 'Fetch Successful');
    }
    throw new HttpException(
      'Unable to Fetch Notifications. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @UseGuards(AuthGuard)
  @Get('unread/count')
  async getUnreadCount(
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const result = await this.notificationsService.getUnreadCount(currentUser);
    if (result) {
      return CreateSuccessResponse(response, result, 'Fetch Successful');
    }
    throw new HttpException(
      'Unable to Fetch Notifications. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @UseGuards(AuthGuard)
  @Patch('readall')
  async markAllAsRead(
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const result = await this.notificationsService.markAllAsRead(currentUser);
    if (result) {
      return CreateSuccessResponse(
        response,
        result,
        'Mark all as read Successful',
      );
    }
    throw new HttpException(
      'Unable to Mark all as read. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':notificationId')
  async markAsRead(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('notificationId') notificationId: string,
    @Res() response: Response,
  ) {
    const result = await this.notificationsService.markAsRead(
      currentUser,
      notificationId,
    );
    if (result) {
      return CreateSuccessResponse(response, result, 'Mark as read Successful');
    }
    throw new HttpException(
      'Unable to Mark as read. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
