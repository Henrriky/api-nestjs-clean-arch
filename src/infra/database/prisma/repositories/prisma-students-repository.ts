import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository'
import { Student } from '@/domain/forum/enterprise/entities/Student'
import { PrismaStudentMapper } from '../mapper/prisma-student-mapper '

@Injectable()
export class PrismaStudentsRepository implements StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Student | null> {
    const studentByEmail = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!studentByEmail) return null

    return PrismaStudentMapper.toDomain(studentByEmail)
  }

  async create(student: Student): Promise<void> {
    const prismaStudent = PrismaStudentMapper.toPrisma(student)

    await this.prisma.user.create({
      data: prismaStudent,
    })
  }
}
