import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { EditAnswerUseCase } from '@/domain/forum/application/use-cases/edit-answer'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { NotAllowedError } from '@/core/error/not-allowed-error'

const editAnswerBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

type EditAnswerBodySchema = z.infer<typeof editAnswerBodySchema>

@Controller('answers/:answerId')
export class EditAnswerController {
  constructor(private readonly editAnswer: EditAnswerUseCase) {}

  @Put()
  @HttpCode(200)
  async handle(
    @Param('answerId') answerId: string,
    @Body(new ZodValidationPipe(editAnswerBodySchema))
    body: EditAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, attachments } = body
    const userId = user.sub

    const result = await this.editAnswer.execute({
      content,
      authorId: userId,
      attachmentsIds: attachments,
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
          throw new BadRequestException()
      }
    }

    const { answer } = result.value

    return {
      answer,
    }
  }
}
