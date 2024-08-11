import { PaginationParams } from '@/core/repositories/paginations-params'
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import { Question } from '@/domain/forum/enterprise/entities/Question'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaQuestionMapper } from '../mapper/prisma-question-mapper'

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: {
        id,
      },
    })

    if (!question) return null

    return PrismaQuestionMapper.toDomain(question)
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { slug },
    })

    if (!question) return null

    return PrismaQuestionMapper.toDomain(question)
  }

  async findManyRecent(params: PaginationParams): Promise<Question[]> {
    const quantity = 10

    const questions = await this.prisma.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: quantity,
      skip: (params.page - 1) * quantity,
    })

    return questions.map(PrismaQuestionMapper.toDomain)
  }

  async create(question: Question): Promise<void> {
    await this.prisma.question.create({
      data: PrismaQuestionMapper.toPrisma(question),
    })
  }

  async save(question: Question): Promise<void> {
    const prismaQuestion = PrismaQuestionMapper.toPrisma(question)

    await this.prisma.question.update({
      where: {
        id: prismaQuestion.id,
      },
      data: prismaQuestion,
    })
  }

  async delete(question: Question): Promise<void> {
    const prismaQuestion = PrismaQuestionMapper.toPrisma(question)

    await this.prisma.question.delete({
      where: {
        id: prismaQuestion.id,
      },
    })
  }
}
