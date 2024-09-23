import { Either, success } from '@/core/either'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'
import { Injectable } from '@nestjs/common'
import { CommentWithAuthor } from '../../enterprise/entities/value-objects/comment-with-author'

interface FetchAnswerCommentsUseCaseInput {
  answerId: string
  page: number
}

type FetchAnswerCommentsUseCaseOutput = Either<
  null,
  {
    comments: CommentWithAuthor[]
  }
>

@Injectable()
export class FetchAnswerCommentsUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    page,
    answerId,
  }: FetchAnswerCommentsUseCaseInput): Promise<FetchAnswerCommentsUseCaseOutput> {
    const comments =
      await this.answerCommentsRepository.findManyByAsnwerIdWithAuthor(
        answerId,
        {
          page,
        },
      )

    return success({
      comments,
    })
  }
}
