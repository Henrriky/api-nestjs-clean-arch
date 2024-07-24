import { expect, it, describe, beforeEach } from 'vitest'
import { FetchQuestionCommentsUseCase } from './fetch-question-comments'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestionComment } from 'test/factories/make-question-comment'

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let usecase: FetchQuestionCommentsUseCase

describe('Fetch Question Comments', () => {
  beforeEach(() => {
    inMemoryQuestionCommentsRepository =
      new InMemoryQuestionCommentsRepository()
    usecase = new FetchQuestionCommentsUseCase(
      inMemoryQuestionCommentsRepository,
    )
  })

  it('should be able to fetch question comments', async () => {
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-1'),
      }),
    )
    await inMemoryQuestionCommentsRepository.create(
      makeQuestionComment({
        questionId: new UniqueEntityID('question-1'),
      }),
    )

    const result = await usecase.execute({
      questionId: 'question-1',
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.questionComments).toHaveLength(2)
    expect(result.value?.questionComments).toEqual([
      expect.objectContaining({
        questionId: new UniqueEntityID('question-1'),
      }),
      expect.objectContaining({
        questionId: new UniqueEntityID('question-1'),
      }),
    ])
  })

  it('should not be able to fetch question comments when no answer is created', async () => {
    const result = await usecase.execute({
      questionId: 'question-1',
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.questionComments).toHaveLength(0)
  })

  it('should be able to fetch paginated question comments', async () => {
    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({
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
    expect(result.value?.questionComments).toHaveLength(2)
  })
})
