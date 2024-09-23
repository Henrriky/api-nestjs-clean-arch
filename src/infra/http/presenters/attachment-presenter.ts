import { Attachment } from '@/domain/forum/enterprise/entities/Attachment'

export class AttachmentPresenter {
  static toHTTP(attachment: Attachment) {
    return {
      id: attachment.id.toString(),
      url: attachment.url,
      title: attachment.title,
    }
  }
}
