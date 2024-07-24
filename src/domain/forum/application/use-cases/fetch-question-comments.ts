import { Either, success } from '@/core/either'
import { QuestionComment } from '../../enterprise/entities/Question-Comment'
import { QuestionCommentsRepository } from '../repositories/question-comments-repository'

interface FetchQuestionCommentsUseCaseInput {
  questionId: string
  page: number
}

type FetchQuestionCommentsUseCaseOutput = Either<
  null,
  {
    questionComments: QuestionComment[]
  }
>
export class FetchQuestionCommentsUseCase {
  constructor(private questionCommentsRepository: QuestionCommentsRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionCommentsUseCaseInput): Promise<FetchQuestionCommentsUseCaseOutput> {
    const questionComments =
      await this.questionCommentsRepository.findManyByTopicId(questionId, {
        page,
      })

    return success({
      questionComments,
    })
  }
}
