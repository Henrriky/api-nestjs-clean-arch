import { Either, failure, success } from '@/core/either'
import { Question } from '../../enterprise/entities/Question'
import { AnswersRepository } from '../repositories/answers-repository'
import { QuestionsRepository } from '../repositories/questions-repository'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'

interface ChooseQuestionBestAnswerUseCaseInput {
  authorId: string
  answerId: string
}

type ChooseQuestionBestAnswerUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  { question: Question }
>

export class ChooseQuestionBestAnswerUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private answerRepository: AnswersRepository,
  ) {}

  async execute({
    authorId,
    answerId,
  }: ChooseQuestionBestAnswerUseCaseInput): Promise<ChooseQuestionBestAnswerUseCaseOutput> {
    const answer = await this.answerRepository.findById(answerId)
    if (!answer) {
      return failure(new ResourceNotFoundError('Answer not found'))
    }

    const question = await this.questionsRepository.findById(
      answer.questionId.toValue(),
    )
    if (!question) {
      return failure(new ResourceNotFoundError('Question not found'))
    }

    if (question.authorId.toString() !== authorId) {
      return failure(
        new NotAllowedError('You are not the author of this question'),
      )
    }

    question.bestAnswerId = answer.id
    await this.questionsRepository.save(question)

    return success({ question })
  }
}
