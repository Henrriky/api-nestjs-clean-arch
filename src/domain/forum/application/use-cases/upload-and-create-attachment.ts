import { Either, failure, success } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Attachment } from '../../enterprise/entities/Attachment'
import { Uploader } from '../storage/uploader'

interface UploadAndCreateAttachmentUseCaseInput {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAttachmentUseCaseOutput = Either<
  InvalidAttachmentTypeError,
  {
    attachment: Attachment
  }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private readonly attachmentRepository: AttachmentsRepository,
    private readonly uploader: Uploader,
  ) {}

  async execute({
    body,
    fileType,
    fileName,
  }: UploadAndCreateAttachmentUseCaseInput): Promise<UploadAndCreateAttachmentUseCaseOutput> {
    const regexTypeValidation = /^(image\/(jpeg|png))$|^application\/pdf$/
    const receivedAttachmentTypeIsValid = regexTypeValidation.test(fileType)

    if (!receivedAttachmentTypeIsValid) {
      return failure(
        new InvalidAttachmentTypeError(fileType, 'jpg, png, jpeg or pdf'),
      )
    }

    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    })

    const attachment = Attachment.create({
      title: fileName,
      url,
    })

    await this.attachmentRepository.create(attachment)

    return success({
      attachment,
    })
  }
}
