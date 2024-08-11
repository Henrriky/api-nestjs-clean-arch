import { Student } from '@/domain/forum/enterprise/entities/Student'
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository'

export class InMemoryStudentsRepository implements StudentsRepository {
  public items: Student[] = []

  async create(student: Student) {
    this.items.push(student)
  }

  async findByEmail(email: string) {
    const question = this.items.find((item) => item.email === email)

    if (!question) return null

    return question
  }
}
