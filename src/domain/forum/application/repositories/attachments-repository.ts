import { Attachment } from '../../enterprise/entities/Attachment'

export abstract class AttachmentsRepository {
  abstract create(attachment: Attachment): Promise<void>
}
