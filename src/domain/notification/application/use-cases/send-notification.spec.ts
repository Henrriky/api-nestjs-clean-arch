import { expect, it, describe, beforeEach } from 'vitest'
import { SendNotificationUseCase } from './send-notification'
import { InMemoryNotificationRepository } from 'test/repositories/in-memory-notification-repository'

let inMemoryNotificationRepository: InMemoryNotificationRepository
let usecase: SendNotificationUseCase

describe('Send Notification', () => {
  beforeEach(() => {
    inMemoryNotificationRepository = new InMemoryNotificationRepository()
    usecase = new SendNotificationUseCase(inMemoryNotificationRepository)
  })

  it('should be able to create a question', async () => {
    const result = await usecase.execute({
      recipientId: '1',
      title: 'New notification',
      content: 'Content notification',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.notification.id).toBeTruthy()
    expect(inMemoryNotificationRepository.items[0].id).toBe(
      result.value?.notification.id,
    )
  })
})
