import { expect, it, describe, beforeEach } from 'vitest'
import { FetchAnswerCommentsUseCase } from './fetch-answer-comments'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository'
import { makeStudent } from 'test/factories/make-student'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let usecase: FetchAnswerCommentsUseCase

describe('Fetch Answer Comments', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentsRepository,
    )
    usecase = new FetchAnswerCommentsUseCase(inMemoryAnswerCommentsRepository)
  })

  it('should be able to fetch answer comments', async () => {
    const student = makeStudent({
      name: 'John doe',
    })

    inMemoryStudentsRepository.items.push(student)

    const comment1 = makeAnswerComment({
      authorId: student.id,
      answerId: new UniqueEntityID('answer-1'),
    })
    const comment2 = makeAnswerComment({
      authorId: student.id,
      answerId: new UniqueEntityID('answer-1'),
    })

    await inMemoryAnswerCommentsRepository.create(comment1)
    await inMemoryAnswerCommentsRepository.create(comment2)

    const result = await usecase.execute({
      answerId: 'answer-1',
      page: 1,
    })
    expect(result.isSuccess()).toBe(true)
    expect(result.value?.comments).toHaveLength(2)
    expect(result.value?.comments).toEqual([
      expect.objectContaining({
        author: 'John doe',
        commentId: comment1.id,
      }),
      expect.objectContaining({
        author: 'John doe',
        commentId: comment2.id,
      }),
    ])
  })

  it('should not be able to fetch answer comments when no answer is created', async () => {
    const result = await usecase.execute({
      answerId: 'answer-1',
      page: 1,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.comments).toHaveLength(0)
  })

  it('should be able to fetch paginated answer comments', async () => {
    const student = makeStudent({
      name: 'John doe',
    })

    inMemoryStudentsRepository.items.push(student)

    for (let i = 1; i <= 22; i++) {
      await inMemoryAnswerCommentsRepository.create(
        makeAnswerComment({
          authorId: student.id,
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
    expect(result.value?.comments).toHaveLength(2)
  })
})
