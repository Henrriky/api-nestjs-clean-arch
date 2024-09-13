import { InMemoryAnswerCommentsRepository } from 'test/repositories/in-memory-answer-comments-repository'
import { DeleteAnswerCommentUseCase } from './delete-answer-comment'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeAnswerComment } from 'test/factories/make-answer-comment'
import { NotAllowedError } from '@/core/error/not-allowed-error'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'

let inMemoryAnswerCommentRepository: InMemoryAnswerCommentsRepository
let usecase: DeleteAnswerCommentUseCase

describe('Delete Answer Comment', () => {
  beforeEach(() => {
    inMemoryAnswerCommentRepository = new InMemoryAnswerCommentsRepository()
    usecase = new DeleteAnswerCommentUseCase(inMemoryAnswerCommentRepository)
  })

  it('should be able to delete a answer comment', async () => {
    const newAnswerComment = makeAnswerComment(
      {
        authorId: new UniqueEntityID('author-id'),
      },
      new UniqueEntityID('answer-comment-1'),
    )

    await inMemoryAnswerCommentRepository.create(newAnswerComment)

    await usecase.execute({
      authorId: newAnswerComment.authorId.toString(),
      answerCommentId: newAnswerComment.id.toString(),
    })

    expect(inMemoryAnswerCommentRepository.items).toHaveLength(0)
  })

  it('should be return an error if the answer comment does not exist', async () => {
    const result = await usecase.execute({
      authorId: 'author-id',
      answerCommentId: 'non-existent-id',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be return an error if the author that is trying to delete the answer comment is not the author of the answer comment', async () => {
    const newAnswerComment = makeAnswerComment(
      {
        authorId: new UniqueEntityID('author-id'),
      },
      new UniqueEntityID('answer-comment-1'),
    )
    await inMemoryAnswerCommentRepository.create(newAnswerComment)

    const result = await usecase.execute({
      authorId: 'another-author-id',
      answerCommentId: newAnswerComment.id.toString(),
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NotAllowedError)
  })
})
