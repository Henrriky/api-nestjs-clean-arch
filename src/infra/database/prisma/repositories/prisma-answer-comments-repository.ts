import { PaginationParams } from '@/core/repositories/paginations-params'
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { AnswerComment } from '@/domain/forum/enterprise/entities/Answer-Comment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaAnswerCommentMapper } from '../mapper/prisma-answer-comment-mapper'

@Injectable()
export class PrismaAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnswerComment | null> {
    const answerComment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    })

    if (!answerComment) return null

    return PrismaAnswerCommentMapper.toDomain(answerComment)
  }

  async findManyByAnswerId(
    answerId: string,
    params: PaginationParams,
  ): Promise<AnswerComment[]> {
    const quantity = 10

    const answerCommentsById = await this.prisma.comment.findMany({
      where: {
        answerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: quantity,
      skip: (params.page - 1) * quantity,
    })

    return answerCommentsById.map(PrismaAnswerCommentMapper.toDomain)
  }

  async create(answerComment: AnswerComment): Promise<void> {
    const prismaAnswerComment =
      PrismaAnswerCommentMapper.toPrisma(answerComment)

    await this.prisma.comment.create({
      data: prismaAnswerComment,
    })
  }

  async delete(answerComment: AnswerComment): Promise<void> {
    await this.prisma.comment.delete({
      where: {
        id: answerComment.id.toString(),
      },
    })
  }
}
