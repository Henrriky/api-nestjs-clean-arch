import { Either, failure, success } from '@/core/either'
import { Answer } from '../../enterprise/entities/Answer'
import { AnswersRepository } from '../repositories/answers-repository'
import { NotAllowedError } from '@/core/error/not-allowed-error'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { AnswerAttachmentsRepository } from '../repositories/answer-attachments-repository'
import { AnswerAttachmentList } from '../../enterprise/entities/Answer-Attachment-List'
import { AnswerAttachment } from '../../enterprise/entities/Answer-Attachment'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

interface EditAnswerUseCaseInput {
  authorId: string
  answerId: string
  content: string
  attachmentsIds: string[]
}

type EditAnswerUseCaseOutput = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    answer: Answer
  }
>

export class EditAnswerUseCase {
  constructor(
    private answersRepository: AnswersRepository,
    private asnwerAttachmentsRepository: AnswerAttachmentsRepository,
  ) {}

  async execute({
    authorId,
    answerId,
    content,
    attachmentsIds,
  }: EditAnswerUseCaseInput): Promise<EditAnswerUseCaseOutput> {
    const answer = await this.answersRepository.findById(answerId)

    if (!answer) {
      return failure(new ResourceNotFoundError('Answer not found'))
    }

    if (answer.authorId.toString() !== authorId) {
      return failure(
        new NotAllowedError('You are not the author of this answer'),
      )
    }

    const currentAnswerAttachments =
      await this.asnwerAttachmentsRepository.findManyByAnswerId(answerId)
    const answerAttachmentList = new AnswerAttachmentList(
      currentAnswerAttachments,
    )

    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        answerId: answer.id,
        attachmentId: new UniqueEntityID(attachmentId),
      })
    })

    answerAttachmentList.update(answerAttachments)
    answer.attachments = answerAttachmentList

    answer.content = content

    await this.answersRepository.save(answer)
    return success({ answer })
  }
}
