import { Either, success } from '@/core/either'
import { QuestionCommentsRepository } from '../repositories/question-comments-repository'
import { Injectable } from '@nestjs/common'
import { CommentWithAuthor } from '../../enterprise/entities/value-objects/comment-with-author'

interface FetchQuestionCommentsUseCaseInput {
  questionId: string
  page: number
}

type FetchQuestionCommentsUseCaseOutput = Either<
  null,
  {
    comments: CommentWithAuthor[]
  }
>

@Injectable()
export class FetchQuestionCommentsUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionCommentsUseCaseInput): Promise<FetchQuestionCommentsUseCaseOutput> {
    const comments =
      await this.questionCommentsRepository.findManyByTopicIdWithAuthor(
        questionId,
        {
          page,
        },
      )

    return success({
      comments,
    })
  }
}
