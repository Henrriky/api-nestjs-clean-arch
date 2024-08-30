import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Notification,
  NotificationProps,
} from '@/domain/notification/enterprise/entities/Notification'
import { faker } from '@faker-js/faker'

export function makeNotification(
  override: Partial<NotificationProps> = {},
  id?: UniqueEntityID,
) {
  const notification = Notification.create(
    {
      recipientId: new UniqueEntityID(),
      title: faker.lorem.text(),
      content: faker.lorem.text(),
      ...override,
    },
    id,
  )

  return notification
}

// @Injectable()
// export class NotificationFactory {
//   constructor(private prisma: PrismaService) {}

//   async makePrismaNotification(
//     data: Partial<NotificationProps> = {},
//   ): Promise<Notification> {
//     const notification = makeNotification(data)

//     await this.prisma.notification.create({
//       data: PrismaNotificationMapper.toPrisma(notification),
//     })

//     return notification
//   }
// }
