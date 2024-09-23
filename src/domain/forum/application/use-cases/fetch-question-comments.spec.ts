import { expect, it, describe, beforeEach } from 'vitest'
import { FetchQuestionCommentsUseCase } from './fetch-question-comments'
import { InMemoryQuestionCommentsRepository } from 'test/repositories/in-memory-question-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestionComment } from 'test/factories/make-question-comment'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository'
import { makeStudent } from 'test/factories/make-student'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let usecase: FetchQuestionCommentsUseCase

describe('Fetch Question Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    inMemoryQuestionCommentsRepository = new InMemoryQuestionCommentsRepository(
      inMemoryStudentsRepository,
    )
    usecase = new FetchQuestionCommentsUseCase(
      inMemoryQuestionCommentsRepository,
    )
  })

  it('should be able to fetch question comments', async () => {
    const student = makeStudent({
      name: 'John Doe',
    })

    inMemoryStudentsRepository.items.push(student)

    const questionComment1 = makeQuestionComment({
      authorId: student.id,
      questionId: new UniqueEntityID('question-1'),
    })
    const questionComment2 = makeQuestionComment({
      authorId: student.id,
      questionId: new UniqueEntityID('question-1'),
    })

    await inMemoryQuestionCommentsRepository.create(questionComment1)
    await inMemoryQuestionCommentsRepository.create(questionComment2)

    const result = await usecase.execute({
      questionId: 'question-1',
      page: 1,
    })
    expect(result.isSuccess()).toBe(true)
    expect(result.value?.comments).toHaveLength(2)
    expect(result.value?.comments).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          author: 'John Doe',
          commentId: questionComment1.id,
        }),
        expect.objectContaining({
          author: 'John Doe',
          commentId: questionComment2.id,
        }),
      ]),
    )
  })

  it('should not be able to fetch question comments when no answer is created', async () => {
    const result = await usecase.execute({
      questionId: 'question-1',
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.comments).toHaveLength(0)
  })

  it('should be able to fetch paginated question comments', async () => {
    const student = makeStudent({
      name: 'John Doe',
    })

    inMemoryStudentsRepository.items.push(student)

    for (let i = 1; i <= 22; i++) {
      await inMemoryQuestionCommentsRepository.create(
        makeQuestionComment({
          authorId: student.id,
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
    expect(result.value?.comments).toHaveLength(2)
  })
})
