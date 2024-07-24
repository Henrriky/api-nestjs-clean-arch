import { expect, it, describe, beforeEach } from 'vitest'
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswerComment } from 'test/factories/make-answer-comment'

let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let usecase: FetchAnswerCommentsUseCase

describe('Fetch Answer Comments', () => {
  beforeEach(() => {
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository()
    usecase = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository)
  })

  it('should be able to fetch answer comments', async () => {
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-1'),
      }),
    )
    await inMemoryAnswerCommentsRepository.create(
      makeAnswerComment({
        answerId: new UniqueEntityID('answer-1'),
      }),
    )

    const result = await usecase.execute({
      answerId: 'answer-1',
      page: 1,
    })
    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answerComments).toHaveLength(2)
    expect(result.value?.answerComments).toEqual([
      expect.objectContaining({
        answerId: new UniqueEntityID('answer-1'),
      }),
      expect.objectContaining({
        answerId: new UniqueEntityID('answer-1'),
      }),
    ])
  })

  it('should not be able to fetch answer comments when no answer is created', async () => {
    const result = await usecase.execute({
      answerId: 'answer-1',
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answerComments).toHaveLength(0)
  })

  it('should be able to fetch paginated answer comments', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          createdAt: new Date(2022, 0, i),
          answerId: new UniqueEntityID('answer-1'),
        }),
      )
    }

    const result = await usecase.execute({
      answerId: 'answer-1',
      page: 3,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answerComments).toHaveLength(2)
  })
})
