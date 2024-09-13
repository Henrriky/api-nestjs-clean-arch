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
import { CommentOnQuestionUseCase } from '@/domain/forum/application/use-cases/comment-on-question'
import { ResourceNotFoundError } from '@/core/error/resource-not-found-error'

const commentOnQuestionBodySchema = z.object({
  content: z.string(),
})

type CommentOnQuestionBodySchema = z.infer<typeof commentOnQuestionBodySchema>

@Controller('questions/:questionId/comments')
export class CommentOnQuestionController {
  constructor(private readonly commentonQuestion: CommentOnQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('questionId') questionId: string,
    @Body(new ZodValidationPipe(commentOnQuestionBodySchema))
    body: CommentOnQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content } = body
    const userId = user.sub

    const result = await this.commentonQuestion.execute({
      questionId,
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
