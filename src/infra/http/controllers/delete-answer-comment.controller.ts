import { NotAllowedError } from '@/core/error/not-allowed-error'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { DeleteAnswerCommentUseCase } from '@/domain/forum/application/use-cases/delete-answer-comment'
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

@Controller('answers/comments/:id')
export class DeleteAnswerCommentController {
  constructor(
    private readonly deleteAnswerComment: DeleteAnswerCommentUseCase,
  ) {}

  @Delete()
  @HttpCode(204)
  async handle(
    @Param('id') answerCommentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const result = await this.deleteAnswerComment.execute({
      authorId: user.sub,
      answerCommentId,
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
