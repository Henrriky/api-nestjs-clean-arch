import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user.decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

const answerQuestionBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>

@Controller('questions/:questionId/answers')
export class AnswerQuestionController {
  constructor(private readonly answerQuestion: AnswerQuestionUseCase) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Param('questionId') questionId: string,
    @Body(new ZodValidationPipe(answerQuestionBodySchema))
    body: AnswerQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { content, attachments } = body
    const userId = user.sub

    const result = await this.answerQuestion.execute({
      instructorId: userId,
      questionId,
      content,
      attachmentsIds: attachments,
    })

    if (result.isFailure()) {
      throw new BadRequestException()
    }
  }
}
