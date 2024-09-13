import { UseCaseError } from '@/core/error/use-case-error'

export class InvalidAttachmentTypeError extends Error implements UseCaseError {
  constructor(type: string, supportedTypes: string) {
    super(`Invalid file type: "${type}". Supported types: ${supportedTypes}`)
  }
}
