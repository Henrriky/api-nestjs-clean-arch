import { expect, it, describe, beforeEach } from 'vitest'
import { InMemoryQuestionsRepository } from 'test/repositories/in-memory-questions-repository'
import { FetchRecentQuestionsUseCase } from './fetch-recent-questions'
import { makeQuestion } from 'test/factories/make-question'
import { InMemoryQuestionAttachmentsRepository } from 'test/repositories/in-memory-question-attachments-repository'

let inMemoryQuestionRepository: InMemoryQuestionsRepository
let inMemoryQuestionAttachmentsRepository: InMemoryQuestionAttachmentsRepository
let usecase: FetchRecentQuestionsUseCase

describe('Fetch Recent Questions', () => {
  beforeEach(() => {
    inMemoryQuestionAttachmentsRepository =
      new InMemoryQuestionAttachmentsRepository()
    inMemoryQuestionRepository = new InMemoryQuestionsRepository(
      inMemoryQuestionAttachmentsRepository,
    )
    usecase = new FetchRecentQuestionsUseCase(inMemoryQuestionRepository)
  })

  it('should be able to fetch recent questions', async () => {
    await inMemoryQuestionRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 20),
      }),
    )
    await inMemoryQuestionRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 22),
      }),
    )
    await inMemoryQuestionRepository.create(
      makeQuestion({
        createdAt: new Date(2022, 0, 24),
      }),
    )

    const result = await usecase.execute({
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.questions).toEqual([
      expect.objectContaining({
        createdAt: new Date(2022, 0, 24),
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 22),
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 20),
      }),
    ])
  })

  it('should be able to fetch paginated recent questions', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionRepository.create(
        makeQuestion({
          createdAt: new Date(2022, 0, i),
        }),
      )
    }

    const result = await usecase.execute({
      page: 3,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.questions).toHaveLength(2)
    expect(result.value?.questions).toEqual([
      expect.objectContaining({
        createdAt: new Date(2022, 0, 2),
      }),
      expect.objectContaining({
        createdAt: new Date(2022, 0, 1),
      }),
    ])
  })
})
