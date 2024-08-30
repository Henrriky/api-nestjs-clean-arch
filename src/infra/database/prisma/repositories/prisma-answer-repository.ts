import { PaginationParams } from '@/core/repositories/paginations-params'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { Answer } from '@/domain/forum/enterprise/entities/Answer'
import { Injectable } from '@nestjs/common'
import { PrismaAnswerMapper } from '../mapper/prisma-answer-mapper'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrismaAnswerRepository implements AnswersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: {
        id,
      },
    })

    if (!answer) return null

    return PrismaAnswerMapper.toDomain(answer)
  }

  async findManyByTopicId(
    answerId: string,
    params: PaginationParams,
  ): Promise<Answer[]> {
    const quantity = 10

    const answersByTopicId = await this.prisma.answer.findMany({
      where: {
        questionId: answerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: quantity,
      skip: (params.page - 1) * quantity,
    })

    return answersByTopicId.map(PrismaAnswerMapper.toDomain)
  }

  async create(answer: Answer): Promise<void> {
    const prismaAnswer = PrismaAnswerMapper.toPrisma(answer)

    await this.prisma.answer.create({
      data: prismaAnswer,
    })
  }

  async save(answer: Answer): Promise<void> {
    const prismaAnswer = PrismaAnswerMapper.toPrisma(answer)

    await this.prisma.answer.update({
      data: prismaAnswer,
      where: {
        id: prismaAnswer.id,
      },
    })
  }

  async delete(answer: Answer): Promise<void> {
    await this.prisma.answer.delete({
      where: {
        id: answer.id.toString(),
      },
    })
  }
}
