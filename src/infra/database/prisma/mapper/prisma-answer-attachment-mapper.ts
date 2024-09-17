import { Prisma, Attachment as PrismaAttachment } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/Answer-Attachment'

export class PrismaAnswerAttachmentMapper {
  static toDomain(raw: PrismaAttachment): AnswerAttachment {
    if (!raw.answerId) throw new Error('Invalid attachment type.')

    return AnswerAttachment.create(
      {
        attachmentId: new UniqueEntityID(raw.id),
        answerId: new UniqueEntityID(raw.answerId),
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toUpdateMany(
    attachments: AnswerAttachment[],
  ): Prisma.AttachmentUpdateManyArgs {
    const attachmentsIds = attachments.map((att) => att.attachmentId.toString())

    return {
      where: {
        id: {
          in: attachmentsIds,
        },
      },
      data: {
        answerId: attachments[0].answerId.toString(),
      },
    }
  }
}
