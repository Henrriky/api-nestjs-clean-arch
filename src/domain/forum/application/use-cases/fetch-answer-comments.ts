import { Either, success } from '@/core/either'
import { AnswerComment } from '../../enterprise/entities/Answer-Comment'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'
import { Injectable } from '@nestjs/common'

interface FetchAnswerCommentsUseCaseInput {
  answerId: string
  page: number
}

type FetchAnswerCommentsUseCaseOutput = Either<
  null,
  {
    answerComments: AnswerComment[]
  }
>

@Injectable()
export class FetchAnswerCommentsUseCase {
  constructor(private answerCommentsRepository: AnswerCommentsRepository) {}

  async execute({
    page,
    answerId,
  }: FetchAnswerCommentsUseCaseInput): Promise<FetchAnswerCommentsUseCaseOutput> {
    const answerComments =
      await this.answerCommentsRepository.findManyByAnswerId(answerId, {
        page,
      })

    return success({
      answerComments,
    })
  }
}
