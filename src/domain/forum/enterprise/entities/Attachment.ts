import { Entity } from '@/core/entities/entity'

export interface AttachmentProps {
  title: string
  link: string
}

export class Attachment extends Entity<AttachmentProps> {
  public get title() {
    return this.props.title
  }

  public get link() {
    return this.props.link
  }
}
