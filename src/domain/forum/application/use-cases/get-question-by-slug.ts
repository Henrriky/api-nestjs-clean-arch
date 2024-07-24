import { Either, failure, success } from '@/core/either'
import { Question } from '../../enterprise/entities/Question'
import { QuestionsRepository } from '../repositories/questions-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'

interface GetQuestionBySlugUseCaseInput {
  slug: string
}

type GetQuestionBySlugUseCaseOutput = Either<
  ResourceNotFoundError,
  {
    question: Question
  }
>

export class GetQuestionBySlugUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    slug,
  }: GetQuestionBySlugUseCaseInput): Promise<GetQuestionBySlugUseCaseOutput> {
    const question = await this.questionsRepository.findBySlug(slug)

    if (!question)
      return failure(new ResourceNotFoundError('Question not found'))

    return success({
      question,
    })
  }
}
