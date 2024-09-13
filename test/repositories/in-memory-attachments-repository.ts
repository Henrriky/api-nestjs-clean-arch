import { AttachmentsRepository } from '@/domain/forum/application/repositories/attachments-repository'
import { Attachment } from '@/domain/forum/enterprise/entities/Attachment'

export class InMemoryAttachmentsRepository implements AttachmentsRepository {
  public items: Attachment[] = []

  constructor() {}

  async create(attachment: Attachment): Promise<void> {
    this.items.push(attachment)
  }
}
