import { Either, failure, success } from '@/core/either'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'

interface DeleteAnswerCommentUseCaseInput {
  authorId: string
  answerCommentId: string
}

type DeleteAnswerCommentUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

export class DeleteAnswerCommentUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    authorId,
    answerCommentId,
  }: DeleteAnswerCommentUseCaseInput): Promise<DeleteAnswerCommentUseCaseOutput> {
    const answerComment =
      await this.answerCommentsRepository.findById(answerCommentId)

    if (!answerComment) {
      return failure(new ResourceNotFoundError('Answer not found'))
    }

    if (answerComment.authorId.toString() !== authorId) {
      return failure(new NotAllowedError())
    }

    await this.answerCommentsRepository.delete(answerComment)
    return success(null)
  }
}
