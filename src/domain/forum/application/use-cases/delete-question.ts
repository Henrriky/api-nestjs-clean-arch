import { Either, failure, success } from '@/core/either'
import { QuestionsRepository } from '../repositories/questions-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'

interface DeleteQuestionUseCaseInput {
  authorId: string
  questionId: string
}

type DeleteQuestionUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

export class DeleteQuestionUseCase {
  constructor(private questionsRepository: QuestionsRepository) {}

  async execute({
    authorId,
    questionId,
  }: DeleteQuestionUseCaseInput): Promise<DeleteQuestionUseCaseOutput> {
    const question = await this.questionsRepository.findById(questionId)

    if (!question) {
      return failure(new ResourceNotFoundError('Question not found'))
    }

    if (question.authorId.toString() !== authorId) {
      return failure(
        new NotAllowedError('You are not the author of this question'),
      )
    }

    await this.questionsRepository.delete(question)
    return success(null)
  }
}
