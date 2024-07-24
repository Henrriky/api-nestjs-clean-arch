import { UseCaseError } from '@/core/error/use-case-error'

export class NotAllowedError extends Error implements UseCaseError {
  constructor(message: string = 'Not Allowed') {
    super(message)
  }
}
