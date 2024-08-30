import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {} from '@/domain/forum/enterprise/entities/Answer-Comment'
import {
  QuestionAttachment,
  QuestionAttachmentProps,
} from '@/domain/forum/enterprise/entities/Question-Attachment'

export function makeQuestionAttachment(
  override: Partial<QuestionAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const questionattachment = QuestionAttachment.create(
    {
      questionId: new UniqueEntityID(),
      attachmentId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return questionattachment
}

// @Injectable()
// export class AnswerAttachmentFactory {
//   constructor(private prisma: PrismaService) {}

//   async makePrismaAnswerAttachment(
//     data: Partial<AnswerAttachmentProps> = {},
//   ): Promise<AnswerAttachment> {
//     const answerAttachment = makeAnswerAttachment(data)

//     await this.prisma.comment.create({
//       data: PrismaAnswerAttachmentMapper.toPrisma(answerAttachment),
//     })

//     return answerAttachment
//   }
// }
