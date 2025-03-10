import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswersRepository } from 'test/repositories/in-memory-answers-repository'
import { makeAnswer } from 'test/factories/make-answer'
import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { InMemoryAnswerAttachmentsRepository } from 'test/repositories/in-memory-answer-attachments-repository'
import { CommentOnAnswerUseCase } from './comment-on-answer'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository'

let inMemoryAnswerAttachmentsRepository: InMemoryAnswerAttachmentsRepository
let inMemoryStudentsRepository: InMemoryStudentsRepository
let inMemoryAnswerCommentsRepository: InMemoryAnswerCommentsRepository
let inMemoryAnswerRepository: InMemoryAnswersRepository
let usecase: CommentOnAnswerUseCase

describe('Comment On Answer', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    inMemoryAnswerAttachmentsRepository =
      new InMemoryAnswerAttachmentsRepository()
    inMemoryAnswerCommentsRepository = new InMemoryAnswerCommentsRepository(
      inMemoryStudentsRepository,
    )
    inMemoryAnswerRepository = new InMemoryAnswersRepository(
      inMemoryAnswerAttachmentsRepository,
    )
    usecase = new CommentOnAnswerUseCase(
      inMemoryAnswerRepository,
      inMemoryAnswerCommentsRepository,
    )
  })

  it('should be able to comment on answer', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-id'),
      },
      new UniqueEntityID('answer-1'),
    )
    await inMemoryAnswerRepository.create(newAnswer)

    await usecase.execute({
      authorId: 'author-id-comment',
      answerId: newAnswer.id.toString(),
      content: 'Comment content',
    })

    expect(inMemoryAnswerCommentsRepository.items).toHaveLength(1)
    expect(inMemoryAnswerCommentsRepository.items[0].content).toEqual(
      'Comment content',
    )
    expect(inMemoryAnswerCommentsRepository.items[0]).toMatchObject({
      content: 'Comment content',
    })
  })

  it('should be return an error if the answer does not exist', async () => {
    const newAnswer = makeAnswer(
      {
        authorId: new UniqueEntityID('author-id'),
      },
      new UniqueEntityID('answer-1'),
    )
    await inMemoryAnswerRepository.create(newAnswer)

    await usecase.execute({
      authorId: 'author-id-comment',
      answerId: newAnswer.id.toString(),
      content: 'Comment content',
    })

    const result = await usecase.execute({
      authorId: 'author-id-comment',
      answerId: 'any-answer-id',
      content: 'Comment content',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
