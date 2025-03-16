import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Either, success } from '@/core/either'
import { NotificationsRepository } from '../repositories/notification-repository'
import { Notification } from '../../enterprise/entities/Notification'
import { Injectable } from '@nestjs/common'

export interface SendNotificationUseCaseInput {
  recipientId: string
  title: string
  content: string
}

export type SendNotificationUseCaseOutput = Either<
  null,
  {
    notification: Notification
  }
>

@Injectable()
export class SendNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    title,
    content,
  }: SendNotificationUseCaseInput): Promise<SendNotificationUseCaseOutput> {
    const notification = Notification.create({
      recipientId: new UniqueEntityID(recipientId),
      title,
      content,
    })

    await this.notificationsRepository.create(notification)

    return success({
      notification,
    })
  }
}
