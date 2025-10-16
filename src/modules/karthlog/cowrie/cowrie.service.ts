import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Cowrie, CowrieHistory } from './entities/cowrie.entity';
import { ICurrentUser } from 'src/modules/users/interfaces/user.interface';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { NOTIFICATION_TYPE } from 'src/modules/notifications/interfaces/notification.interface';

@Injectable()
export class CowrieService {
  constructor(
    @InjectRepository(Cowrie)
    private readonly cowrieRepository: Repository<Cowrie>,
    @InjectRepository(CowrieHistory)
    private readonly cowrieHistoryRepository: Repository<CowrieHistory>,

    private notificationService: NotificationsService,
  ) {}

  private readonly logger = new Logger('Cowrie');

  async onModuleInit() {
    try {
      await Promise.all([this.setCowrieRateValue()]);

      this.logger.log('Cowrie Rate Created');
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async setCowrieRateValue(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cowrieData = await this.cowrieRepository.findOne({
      where: { isCreated: true },
    });
    if (!cowrieData) {
      await this.setCowrieRate({
        amountPerCowrie: 100,
        currency: 'NGN',
        isCreated: true,
      });
    }
  }

  async setCowrieRate(payload: Partial<Cowrie>): Promise<Cowrie> {
    await this.cowrieHistoryRepository.save({
      rate: payload.amountPerCowrie,
    });

    const cowrieRate = await this.cowrieRepository.save({
      ...payload,
    });

    if (cowrieRate) {
      await this.notificationService.create({
        // recipient: user,
        notificationMessage: `Currency price update (new value of cowrie) ${payload.amountPerCowrie} per cowrie`,
        notificationType: NOTIFICATION_TYPE.WALLET_BALANCE,
      });
    }

    return cowrieRate;
  }

  async updateCowrieRate(
    payload: Partial<Cowrie>,
    currentUser: ICurrentUser,
  ): Promise<UpdateResult> {
    await this.cowrieHistoryRepository.save({
      rate: payload.amountPerCowrie,
      emailOfSetter: currentUser.email,
    });
    return this.cowrieRepository.update(
      { isCreated: true },
      {
        ...payload,
      },
    );
  }

  async getCowrieRate(): Promise<Cowrie> {
    const cowrieData = await this.cowrieRepository.findOne({
      where: { isCreated: true },
    });
    return cowrieData;
  }

  async getCowrieRateHistory(): Promise<CowrieHistory[]> {
    const cowrieData = await this.cowrieHistoryRepository.find();
    return cowrieData;
  }
}
