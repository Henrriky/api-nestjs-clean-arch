import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AttachmentsRepository } from '@/domain/forum/application/repositories/attachments-repository'
import { Attachment } from '@/domain/forum/enterprise/entities/Attachment'
import { PrismaAttachmentMapper } from '../mapper/prisma-attachment-mapper'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(attachment: Attachment): Promise<void> {
    const prismaAttachment = PrismaAttachmentMapper.toPrisma(attachment)

    await this.prisma.attachment.create({
      data: prismaAttachment,
    })
  }
}
