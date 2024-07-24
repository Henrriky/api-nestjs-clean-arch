import { Either, success } from '@/core/either'
import { Question } from '../../enterprise/entities/Question'
import { QuestionsRepository } from '../repositories/questions-repository'

interface FetchRecentQuestionsUseCaseInput {
  page: number
}

type FetchRecentQuestionsUseCaseOutput = Either<
  null,
  {
    questions: Question[]
  }
>

export class FetchRecentQuestionsUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    page,
  }: FetchRecentQuestionsUseCaseInput): Promise<FetchRecentQuestionsUseCaseOutput> {
    const questions = await this.questionsRepository.findManyRecent({
      page,
    })

    return success({
      questions,
    })
  }
}
