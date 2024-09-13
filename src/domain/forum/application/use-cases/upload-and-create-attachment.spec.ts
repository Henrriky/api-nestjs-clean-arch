import { expect, it, describe, beforeEach } from 'vitest'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { FakeUploader } from 'test/storage/fake-uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader
let usecase: UploadAndCreateAttachmentUseCase

describe('Upload and Create Attachment', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    fakeUploader = new FakeUploader()
    usecase = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should be able to upload and create an attachment', async () => {
    const result = await usecase.execute({
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      attachment: inMemoryAttachmentsRepository.items[0],
    })
    expect(fakeUploader.uploads).toHaveLength(1)
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'profile.png',
      }),
    )
  })

  it('should be able to upload an attachment with invalid file type', async () => {
    const result = await usecase.execute({
      fileName: 'profile.png',
      fileType: 'audio/mpeg',
      body: Buffer.from(''),
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })
})
