import { WatchedList } from '@/core/entities/watched-list'
import { AnswerAttachment } from './Answer-Attachment'

export class AnswerAttachmentList extends WatchedList<AnswerAttachment> {
  compareItems(a: AnswerAttachment, b: AnswerAttachment): boolean {
    return a.attachmentId.equals(b.attachmentId)
  }
}
