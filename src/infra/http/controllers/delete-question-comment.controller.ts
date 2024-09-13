import { NotAllowedError } from '@/core/error/not-allowed-error'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { DeleteQuestionCommentUseCase } from '@/domain/forum/application/use-cases/delete-question-comment'
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

@Controller('questions/comments/:id')
export class DeleteQuestionCommentController {
  constructor(
    private readonly deleteQuestionComment: DeleteQuestionCommentUseCase,
  ) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') questionCommentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deleteQuestionComment.execute({
      authorId: user.sub,
      questionCommentId,
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
