import { Either, failure, success } from '@/core/either'
import { NotificationsRepository } from '../repositories/notification-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'
import { Notification } from '../../enterprise/entities/Notification'

interface ReadNotificationUseCaseInput {
  recipientId: string
  notificationId: string
}

type ReadNotificationUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    notification: Notification
  }
>

export class ReadNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    notificationId,
  }: ReadNotificationUseCaseInput): Promise<ReadNotificationUseCaseOutput> {
    const notification =
      await this.notificationsRepository.findById(notificationId)

    if (!notification) {
      return failure(new ResourceNotFoundError('Notification not found'))
    }

    if (recipientId !== notification.recipientId.toString()) {
      return failure(
        new NotAllowedError('You are not the recipient of notification'),
      )
    }

    notification.read()

    await this.notificationsRepository.save(notification)

    return success({
      notification,
    })
  }
}
