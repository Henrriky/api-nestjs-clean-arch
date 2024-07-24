import { UseCaseError } from '@/core/error/use-case-error'

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(message: string = 'Resource not found') {
    super(message)
  }
}
