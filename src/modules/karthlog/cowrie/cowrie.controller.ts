import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CowrieService } from './cowrie.service';
import { Response } from 'express';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ICurrentUser } from 'src/modules/users/interfaces/user.interface';
import { UpdateCowrieRateDto } from './dto/update-cowrie.dto';

@Controller('karthlog/cowrie')
export class CowrieController {
  constructor(private readonly cowrieService: CowrieService) {}

  @Get('')
  async getCowrieRate(@Res() response: Response) {
    const cowrieRate = await this.cowrieService.getCowrieRate();
    if (cowrieRate) {
      return CreateSuccessResponse(response, cowrieRate, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get Cowrie Rate. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get('history')
  async getCowrieRateHistory(@Res() response: Response) {
    const cowrieRateHistory = await this.cowrieService.getCowrieRateHistory();
    if (cowrieRateHistory) {
      return CreateSuccessResponse(response, cowrieRateHistory, 'Successfull');
    }
    throw new HttpException(
      'Unable to Get Cowrie Rate History. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('')
  async updateCowrieRateupdate(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() body: UpdateCowrieRateDto,
    @Res() response: Response,
  ) {
    const updatedRate = await this.cowrieService.updateCowrieRate(
      body,
      currentUser,
    );
    if (updatedRate) {
      return CreateSuccessResponse(response, updatedRate, 'Successful');
    }
    throw new HttpException(
      'Unable to Update Cowrie Rate. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
