import { PaginationParams } from '@/core/repositories/paginations-params'
import { QuestionComment } from '../../enterprise/entities/Question-Comment'
import { CommentWithAuthor } from '../../enterprise/entities/value-objects/comment-with-author'

export abstract class QuestionCommentsRepository {
  abstract findById(id: string): Promise<QuestionComment | null>

  abstract findManyByTopicId(
    questionId: string,
    params: PaginationParams,
  ): Promise<QuestionComment[]>

  abstract findManyByTopicIdWithAuthor(
    questionId: string,
    params: PaginationParams,
  ): Promise<CommentWithAuthor[]>

  abstract create(questionComment: QuestionComment): Promise<void>
  abstract delete(questionComment: QuestionComment): Promise<void>
}
