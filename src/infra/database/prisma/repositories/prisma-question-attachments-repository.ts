import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionAttachment } from '@/domain/forum/enterprise/entities/Question-Attachment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaQuestionAttachmentMapper } from '../mapper/prisma-question-attachment-mapper'

@Injectable()
export class PrismaQuestionAttachmentsrepository
  implements QuestionAttachmentsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findManyByQuestionId(
    questionId: string,
  ): Promise<QuestionAttachment[]> {
    const questionAttachments = await this.prisma.attachment.findMany({
      where: {
        questionId,
      },
    })

    return questionAttachments.map(PrismaQuestionAttachmentMapper.toDomain)
  }

  async deleteManyByQuestionId(questionId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: {
        questionId,
      },
    })
  }
}
