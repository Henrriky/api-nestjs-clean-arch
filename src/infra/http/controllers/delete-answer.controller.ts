import { NotAllowedError } from '@/core/error/not-allowed-error'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { DeleteAnswerUseCase } from '@/domain/forum/application/use-cases/delete-answer'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
  UnauthorizedException,
} from '@nestjs/common'

@Controller('answers/:id')
export class DeleteAnswerController {
  constructor(private readonly deleteAnswer: DeleteAnswerUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') answerId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deleteAnswer.execute({
      authorId: user.sub,
      answerId,
    })

    if (result.isFailure()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
