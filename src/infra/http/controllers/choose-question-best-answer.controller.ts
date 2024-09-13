import { NotAllowedError } from '@/core/error/not-allowed-error'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { ChooseQuestionBestAnswerUseCase } from '@/domain/forum/application/use-cases/choose-question-best-answer'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import {
  BadRequestException,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  UnauthorizedException,
} from '@nestjs/common'

@Controller('/answers/:answerId/choose-as-best')
export class ChooseQuestionBestAnswerController {
  constructor(
    private readonly chooseQuestionBestAnswer: ChooseQuestionBestAnswerUseCase,
  ) {}

  @Patch()
  @HttpCode(204)
  async handle(
    @Param('answerId') answerId: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    const result = await this.chooseQuestionBestAnswer.execute({
      answerId,
      authorId: currentUser.sub,
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
