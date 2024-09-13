import { AnswersRepository } from '../repositories/answers-repository'
import { AnswerComment } from '../../enterprise/entities/Answer-Comment'
import { AnswerCommentsRepository } from '../repositories/answer-comments-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { Either, failure, success } from '@/core/either'
import { Injectable } from '@nestjs/common'

interface CommentOnAnswerUseCaseInput {
  answerId: string
  authorId: string
  content: string
}

type CommentOnAnswerUseCaseOutput = Either<
  ResourceNotFoundError,
  {
    answerComment: AnswerComment
  }
>

@Injectable()
export class CommentOnAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private answerCommentsRepository: AnswerCommentsRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
  }: CommentOnAnswerUseCaseInput): Promise<CommentOnAnswerUseCaseOutput> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return failure(new ResourceNotFoundError('Answer not found.'))
    }

    const answerComment = AnswerComment.create({
      authorId: new UniqueEntityID(authorId),
      answerId: new UniqueEntityID(answerId),
      content,
    })

    await this.answerCommentsRepository.create(answerComment)
    return success({ answerComment })
  }
}
