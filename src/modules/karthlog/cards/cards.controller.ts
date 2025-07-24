import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { Roles } from 'src/common/decorator/roles.decorator';
import { USER_ROLE } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import {
  CreateCardDto,
  MintCardsDto,
  ScanCardDto,
} from './dto/create-card.dto';
import { Response } from 'express';
import { ICurrentUser } from 'src/modules/users/interfaces/user.interface';
import { CurrentUser } from 'src/common/decorator/current-user.decorator';

@Controller('karthlog/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('')
  async createCard(@Body() body: CreateCardDto, @Res() response: Response) {
    const card = await this.cardsService.create(body);
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Create Card. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post('mint')
  async mintNewCards(@Body() body: MintCardsDto, @Res() response: Response) {
    const card = await this.cardsService.mintNewCards(
      body.cardId,
      body.amountToMint,
    );
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Mint New Cards. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get(':id')
  async getSingleCard(@Param() id: string, @Res() response: Response) {
    const card = await this.cardsService.findOne(id);
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Get Card. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get('')
  async getCard(@Res() response: Response) {
    const cards = await this.cardsService.findAllCards();
    if (cards) {
      return CreateSuccessResponse(response, cards, 'Successful');
    }
    throw new HttpException(
      'Unable to Get Cards. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch(':cardId')
  async updateCard(
    @Body() body: Partial<CreateCardDto>,
    @Param() cardId: string,
    @Res() response: Response,
  ) {
    const card = await this.cardsService.updateCard(body, cardId);
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Update Card. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('toggle/:cardId')
  async toggleCardStatus(@Param() cardId: string, @Res() response: Response) {
    const card = await this.cardsService.toggleCardStatus(cardId);
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Toggle Card Status. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':cardId')
  async deleteCard(@Param() cardId: string, @Res() response: Response) {
    const card = await this.cardsService.deleteCard(cardId);
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Delete Card. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Roles(USER_ROLE.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Patch('scan')
  async scanCardAndCreditUser(
    @Body() body: ScanCardDto,
    @CurrentUser() currentUser: ICurrentUser,
    @Res() response: Response,
  ) {
    const card = await this.cardsService.scanCardAndCreditUser(
      body,
      currentUser.sub,
    );
    if (card) {
      return CreateSuccessResponse(response, card, 'Successful');
    }
    throw new HttpException(
      'Unable to Update Card. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
