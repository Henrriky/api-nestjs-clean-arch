import { Either, failure, success } from '@/core/either'
import { AnswersRepository } from '../repositories/answers-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'

interface DeleteAnswerUseCaseInput {
  authorId: string
  answerId: string
}

type DeleteAnswerUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  null
>

export class DeleteAnswerUseCase {
  constructor(private answersRepository: AnswersRepository) {}

  async execute({
    authorId,
    answerId,
  }: DeleteAnswerUseCaseInput): Promise<DeleteAnswerUseCaseOutput> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return failure(new ResourceNotFoundError('Answer not found'))
    }

    if (answer.authorId.toString() !== authorId) {
      return failure(
        new NotAllowedError('You are not the author of this answer'),
      )
    }

    await this.answersRepository.delete(answer)
    return success(null)
  }
}
