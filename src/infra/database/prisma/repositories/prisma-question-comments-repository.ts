import { PaginationParams } from '@/core/repositories/paginations-params'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { QuestionComment } from '@/domain/forum/enterprise/entities/Question-Comment'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrismaQuestionCommentMapper } from '../mapper/prisma-question-comment-mapper'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { PrismaCommentWithAuthorMapper } from '../mapper/prisma-comment-with-author-mapper'

@Injectable()
export class PrismaQuestionCommentsRepository
  implements QuestionCommentsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<QuestionComment | null> {
    const questionComment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
    })

    if (!questionComment) return null

    return PrismaQuestionCommentMapper.toDomain(questionComment)
  }

  async findManyByTopicId(
    questionId: string,
    params: PaginationParams,
  ): Promise<QuestionComment[]> {
    const quantity = 10

    const questionsByTopicId = await this.prisma.comment.findMany({
      where: {
        questionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: quantity,
      skip: (params.page - 1) * 10,
    })

    return questionsByTopicId.map(PrismaQuestionCommentMapper.toDomain)
  }

  async findManyByTopicIdWithAuthor(
    questionId: string,
    params: PaginationParams,
  ): Promise<CommentWithAuthor[]> {
    const quantity = 10

    const questionsByTopicId = await this.prisma.comment.findMany({
      where: {
        questionId,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: quantity,
      skip: (params.page - 1) * 10,
    })

    return questionsByTopicId.map(PrismaCommentWithAuthorMapper.toDomain)
  }

  async create(questionComment: QuestionComment): Promise<void> {
    const prismaQuestionComment =
      PrismaQuestionCommentMapper.toPrisma(questionComment)

    await this.prisma.comment.create({
      data: prismaQuestionComment,
    })
  }

  async delete(questionComment: QuestionComment): Promise<void> {
    await this.prisma.comment.delete({
      where: {
        id: questionComment.id.toString(),
      },
    })
  }
}
