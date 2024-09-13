import {
  Comment,
  CommentProps,
} from '@/domain/forum/enterprise/entities/Comment'

export class CommentPresenter {
  static toHTTP<T extends CommentProps>(comment: Comment<T>) {
    return {
      id: comment.id.toString(),
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }
  }
}
