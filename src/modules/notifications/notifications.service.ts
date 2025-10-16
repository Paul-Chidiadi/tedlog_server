import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { ICurrentUser } from '../users/interfaces/user.interface';
import { FetchNotificationsDto } from './dto/fetch-notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    createNotification: Partial<Notification>,
  ): Promise<Notification> {
    const savedResult =
      await this.notificationRepository.save(createNotification);
    return savedResult;
  }

  async delete(notificationId: string): Promise<DeleteResult> {
    const deletedResult = await this.notificationRepository.delete({
      id: notificationId,
    });
    return deletedResult;
  }

  async findAllForAUser(
    currentUser: ICurrentUser,
    filter?: FetchNotificationsDto,
  ) {
    const { page = 1, limit = 10, search = '' } = filter || {};

    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.recipient', 'recipient')
      .where('(recipient.id = :userId OR notification.recipient IS NULL)', {
        userId: currentUser.sub,
      });

    if (search) {
      query.andWhere('LOWER(notification.notificationMessage) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    query.orderBy('notification.createdAt', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  async markAllAsRead(currentUser: ICurrentUser) {
    return await this.notificationRepository.update(
      { recipient: { id: currentUser.sub } },
      { isSettled: true },
    );
  }

  async markAsRead(currentUser: ICurrentUser, notificationId: string) {
    return await this.notificationRepository.update(
      { id: notificationId, recipient: { id: currentUser.sub } },
      { isSettled: true },
    );
  }

  async getUnreadCount(currentUser: ICurrentUser) {
    return this.notificationRepository.count({
      where: { recipient: { id: currentUser.sub }, isSettled: false },
    });
  }
}
