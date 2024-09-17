import { Instructor } from '@/domain/forum/enterprise/entities/Instructor'
import { Question } from '@/domain/forum/enterprise/entities/Question'
import { Student } from '@/domain/forum/enterprise/entities/Student'
import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { AnswerQuestionUseCase } from './answer-question'
import { expect, it, describe, beforeEach } from 'vitest'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'

let inMemoryAnswersRepository: InMemoryAnswersRepository
let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let usecase: AnswerQuestionUseCase

describe('Answer Question', () => {
  beforeEach(() => {
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswersRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    usecase = new AnswerQuestionUseCase(inMemoryAnswersRepository)
  })

  it('should be able to answer a question', async () => {
    const instructor = Instructor.create({
      name: 'Belleti',
    })
    const student = Student.create({
      name: 'Henrriky',
      email: 'eu@gmail.com',
      password: 'seila',
    })
    const question = Question.create({
      title: 'Title question',
      content: 'Content question',
      authorId: student.id,
      slug: Slug.create('title-question'),
    })
    const result = await usecase.execute({
      instructorId: instructor.id.toString(),
      questionId: question.id.toString(),
      content: 'Content answer',
      attachmentsIds: ['1', '2'],
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.answer.content).toEqual('Content answer')
    expect(inMemoryAnswersRepository.items[0].id).toBe(result.value?.answer.id)
    expect(
      inMemoryAnswersRepository.items[0].attachments.currentItems,
    ).toHaveLength(2)

    expect(inMemoryAnswersRepository.items[0].attachments.currentItems).toEqual(
      [
        expect.objectContaining({ attachmentId: new UniqueEntityID('1') }),
        expect.objectContaining({ attachmentId: new UniqueEntityID('2') }),
      ],
    )
  })

  it('should persist attachments when creating a new answer', async () => {
    const instructor = Instructor.create({
      name: 'Belleti',
    })
    const student = Student.create({
      name: 'Henrriky',
      email: 'eu@gmail.com',
      password: 'seila',
    })
    const question = Question.create({
      title: 'Title question',
      content: 'Content question',
      authorId: student.id,
      slug: Slug.create('title-question'),
    })

    const result = await usecase.execute({
      instructorId: instructor.id.toString(),
      content: 'Answer content',
      questionId: question.id.toString(),
      attachmentsIds: ['1', '2'],
    })

    expect(result.isSuccess()).toBe(true)
    expect(inMemoryAnswerAttachmentsRepository.items).toHaveLength(2)
    expect(inMemoryAnswerAttachmentsRepository.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attachmentId: new UniqueEntityID('1'),
        }),
        expect.objectContaining({
          attachmentId: new UniqueEntityID('2'),
        }),
      ]),
    )
  })
})
