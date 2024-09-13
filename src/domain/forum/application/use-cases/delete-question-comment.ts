import { Either, failure, success } from '@/core/either'
import { QuestionCommentsRepository } from '../repositories/question-comments-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'
import { Injectable } from '@nestjs/common'

interface DeleteQuestionCommentUseCaseInput {
  authorId: string
  questionCommentId: string
}

type DeleteQuestionCommentUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

@Injectable()
export class DeleteQuestionCommentUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    authorId,
    questionCommentId,
  }: DeleteQuestionCommentUseCaseInput): Promise<DeleteQuestionCommentUseCaseOutput> {
    const questionComment =
      await this.questionCommentsRepository.findById(questionCommentId)

    if (!questionComment) {
      return failure(new ResourceNotFoundError('Question Comment not found'))
    }

    if (questionComment.authorId.toString() !== authorId) {
      return failure(
        new NotAllowedError('You are not the author of this comment'),
      )
    }

    await this.questionCommentsRepository.delete(questionComment)
    return success(null)
  }
}
