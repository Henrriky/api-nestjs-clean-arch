import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {} from '@/domain/forum/enterprise/entities/Answer-Comment'
import {
  AnswerAttachment,
  AnswerAttachmentProps,
} from '@/domain/forum/enterprise/entities/Answer-Attachment'

export function makeAnswerAttachment(
  override: Partial<AnswerAttachmentProps> = {},
  id?: UniqueEntityID,
) {
  const answerattachment = AnswerAttachment.create(
    {
      answerId: new UniqueEntityID(),
      attachmentId: new UniqueEntityID(),
      ...override,
    },
    id,
  )

  return answerattachment
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
