import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Answer } from '@/domain/forum/enterprise/entities/Answer'
import { AnswersRepository } from '../repositories/answers-repository'
import { Either, success } from '@/core/either'
import { AnswerAttachmentList } from '../../enterprise/entities/Answer-Attachment-List'
import { AnswerAttachment } from '../../enterprise/entities/Answer-Attachment'

interface AnswerQuestionUseCaseInput {
  instructorId: string
  questionId: string
  attachmentsIds: string[]
  content: string
}

type AnswerQuestionUseCaseOuput = Either<null, { answer: Answer }>

export class AnswerQuestionUseCase {
  constructor(private answerRepository: AnswersRepository) {}

  async execute({
    questionId,
    instructorId,
    content,
    attachmentsIds,
  }: AnswerQuestionUseCaseInput): Promise<AnswerQuestionUseCaseOuput> {
    const answer = Answer.create({
      content,
      authorId: new UniqueEntityID(instructorId),
      questionId: new UniqueEntityID(questionId),
    })

    const answerAttachments = attachmentsIds.map((attachmentId) => {
      return AnswerAttachment.create({
        attachmentId: new UniqueEntityID(attachmentId),
        answerId: answer.id,
      })
    })

    answer.attachments = new AnswerAttachmentList(answerAttachments)

    await this.answerRepository.create(answer)

    return success({ answer })
  }
}
