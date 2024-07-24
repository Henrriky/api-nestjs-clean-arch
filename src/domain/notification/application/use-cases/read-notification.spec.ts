import { expect, it, describe, beforeEach } from 'vitest'
import { makeNotification } from 'test/factories/make-notification'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { ReadNotificationUseCase } from './read-notification'
import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notification-repository'
import { Notification } from '../../enterprise/entities/Notification'
import { NotAllowedError } from '@/core/error/not-allowed-error'

let inMemoryNotificationsRepository: InMemoryNotificationRepository
let usecase: ReadNotificationUseCase

describe('Read Notification', () => {
  beforeEach(() => {
    inMemoryNotificationsRepository = new InMemoryNotificationRepository()
    usecase = new ReadNotificationUseCase(inMemoryNotificationsRepository)
  })

  it('should be able to read notification', async () => {
    const newNotification = makeNotification()

    await inMemoryNotificationsRepository.create(newNotification)

    const result = await usecase.execute({
      recipientId: newNotification.recipientId.toString(),
      notificationId: newNotification.id.toString(),
    })
    expect(result.isSuccess()).toBe(true)
    expect(
      (result.value as { notification: Notification }).notification.title,
    ).toEqual(newNotification.title)
    expect(
      (result.value as { notification: Notification }).notification.readAt,
    ).toEqual(expect.any(Date))
  })

  it('should be return an error if the notification does not exist', async () => {
    const result = await usecase.execute({
      recipientId: 'id',
      notificationId: 'id-nonexistent',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be able to read a notification from another user', async () => {
    const newNotification = makeNotification()

    await inMemoryNotificationsRepository.create(newNotification)

    const result = await usecase.execute({
      notificationId: newNotification.id.toString(),
      recipientId: 'not-recipient-id',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
