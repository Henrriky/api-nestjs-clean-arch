import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {} from '@/domain/forum/enterprise/entities/Answer-Comment'
import {
  AnswerAttachment,
  AnswerAttachmentProps,
} from '@/domain/forum/enterprise/entities/Answer-Attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

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

@Injectable()
export class AnswerAttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAnswerAttachment(
    data: Partial<AnswerAttachmentProps>,
  ): Promise<AnswerAttachment> {
    const answerAttachment = makeAnswerAttachment(data)

    await this.prisma.attachment.update({
      where: {
        id: answerAttachment.attachmentId.toString(),
      },
      data: {
        answerId: answerAttachment.answerId.toString(),
      },
    })

    return answerAttachment
  }
}
