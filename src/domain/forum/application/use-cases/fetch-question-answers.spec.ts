import { expect, it, describe, beforeEach } from 'vitest'
import { FetchQuestionAnswersUseCase } from './fetch-question-answers'
import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository

let usecase: FetchQuestionAnswersUseCase

describe('Fetch Question Asnwers', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    usecase = new FetchQuestionAnswersUseCase(inMemoryAnswersRepository)
  })

  it('should be able to fetch question answers', async () => {
    await inMemoryAnswersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-1'),
      }),
    )
    await inMemoryAnswersRepository.create(
      makeAnswer({
        questionId: new UniqueEntityID('question-1'),
      }),
    )

    const result = await usecase.execute({
      questionId: 'question-1',
      page: 1,
    })
    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answers).toHaveLength(2)
    expect(result.value?.answers).toEqual([
      expect.objectContaining({
        questionId: new UniqueEntityID('question-1'),
      }),
      expect.objectContaining({
        questionId: new UniqueEntityID('question-1'),
      }),
    ])
  })

  it('should not be able to fetch question answers when no answer is created', async () => {
    const result = await usecase.execute({
      questionId: 'question-1',
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answers).toHaveLength(0)
  })

  it('should be able to fetch paginated question answers', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswersRepository.create(
        makeAnswer({
          createdAt: new Date(2022, 0, i),
          questionId: new UniqueEntityID('question-1'),
        }),
      )
    }

    const result = await usecase.execute({
      questionId: 'question-1',
      page: 3,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answers).toHaveLength(2)
  })
})
