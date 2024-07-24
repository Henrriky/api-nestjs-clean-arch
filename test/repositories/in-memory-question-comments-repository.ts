import { PaginationParams } from '@/core/repositories/paginations-params'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { QuestionComment } from '@/domain/forum/enterprise/entities/Question-Comment'

export class InMemoryQuestionCommentsRepository
  implements QuestionCommentsRepository
{
  public items: QuestionComment[] = []

  async findById(id: string) {
    const questionComment = this.items.find((item) => item.id.toString() === id)

    if (!questionComment) return null

    return questionComment
  }

  async findManyByTopicId(
    questionId: string,
    params: PaginationParams,
  ): Promise<QuestionComment[]> {
    params.page = Math.max(1, params.page)
    const limit = 10
    const previousOffset = (params.page - 1) * limit
    const finalOffset = params.page * limit

    const answers = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice(previousOffset, finalOffset)

    return answers
  }

  async create(questionComment: QuestionComment) {
    this.items.push(questionComment)
  }

  async delete(questionComment: QuestionComment) {
    const itemIndex = this.items.findIndex(
      (item) => item.id === questionComment.id,
    )

    this.items.splice(itemIndex, 1)
  }
}
