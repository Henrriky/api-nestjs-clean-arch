import { Either, success } from '@/core/either'
import { Answer } from '../../enterprise/entities/Answer'
import { AnswersRepository } from '../repositories/answers-repository'

interface FetchQuestionAnswersUseCaseInput {
  questionId: string
  page: number
}

type FetchQuestionAnswersUseCaseOutput = Either<
  null,
  {
    answers: Answer[]
  }
>

export class FetchQuestionAnswersUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    page,
    questionId,
  }: FetchQuestionAnswersUseCaseInput): Promise<FetchQuestionAnswersUseCaseOutput> {
    const answers = await this.answersRepository.findManyByTopicId(questionId, {
      page,
    })

    return success({
      answers,
    })
  }
}
