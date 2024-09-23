import { PaginationParams } from '@/core/repositories/paginations-params'
import { QuestionCommentsRepository } from '@/domain/forum/application/repositories/question-comments-repository'
import { QuestionComment } from '@/domain/forum/enterprise/entities/Question-Comment'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { InMemoryStudentsRepository } from './in-memory-student-repository'

export class InMemoryQuestionCommentsRepository
  implements QuestionCommentsRepository
{
  public items: QuestionComment[] = []

  constructor(
    private readonly studentsRepository: InMemoryStudentsRepository,
  ) {}

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

    const questionComments = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice(previousOffset, finalOffset)

    return questionComments
  }

  async findManyByTopicIdWithAuthor(
    questionId: string,
    params: PaginationParams,
  ): Promise<CommentWithAuthor[]> {
    params.page = Math.max(1, params.page)
    const limit = 10
    const previousOffset = (params.page - 1) * limit
    const finalOffset = params.page * limit

    const questionComments = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice(previousOffset, finalOffset)
      .map((comment) => {
        const author = this.studentsRepository.items.find((student) => {
          return student.id.equals(comment.authorId)
        })

        if (!author) {
          throw new Error(
            `Author with ID "${comment.authorId.toString()}" does not exist.`,
          )
        }
        return CommentWithAuthor.create({
          commentId: comment.id,
          author: author.name,
          authorId: comment.authorId,
          content: comment.content,
          updatedAt: comment.updatedAt,
          createdAt: comment.createdAt,
        })
      })

    return questionComments
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
