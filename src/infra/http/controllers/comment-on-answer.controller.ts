import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'
import { CommentOnAnswerUseCase } from '@/domain/forum/application/use-cases/comment-on-answer'

const commentOnAnswerBodySchema = z.object({
  content: z.string(),
})

type CommentOnAnswerBodySchema = z.infer<typeof commentOnAnswerBodySchema>

@Controller('answers/:answerId/comments')
export class CommentOnAnswerController {
  constructor(private readonly commentOnAnswer: CommentOnAnswerUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('answerId') answerId: string,
    @Body(new ZodValidationPipe(commentOnAnswerBodySchema))
    body: CommentOnAnswerBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.commentOnAnswer.execute({
      answerId,
      content,
      authorId: userId,
    })

    if (result.isFailure()) {
      const error = result.value
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
