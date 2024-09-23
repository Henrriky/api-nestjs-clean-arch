import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionCommentFactory } from 'test/factories/make-question-comment'
import { StudentFactory } from 'test/factories/make-student'

describe('Fetch Question comments (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let questionCommentFactory: QuestionCommentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        QuestionCommentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    questionCommentFactory = moduleRef.get(QuestionCommentFactory)

    await app.init()
  })

  test('[GET] /questions/:questionId/comments', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })
    const instructor = await studentFactory.makePrismaStudent({
      name: 'John doe 1',
      email: 'johndoe1@example.com',
      password: await hash('123456', 8),
    })
    const accessToken = jwt.sign({ sub: instructor.id.toString() })

    const question = await questionFactory.makePrismaQuestion({
      title: 'Question title',
      content: 'question content',
      slug: Slug.create('question-title'),
      authorId: user.id,
    })

    await Promise.all([
      questionCommentFactory.makePrismaQuestionComment({
        content: 'Question comment 1',
        questionId: question.id,
        authorId: instructor.id,
      }),
      questionCommentFactory.makePrismaQuestionComment({
        content: 'Question comment 2',
        questionId: question.id,
        authorId: instructor.id,
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/questions/${question.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Question comment 1',
          author: instructor.name,
        }),
        expect.objectContaining({
          content: 'Question comment 2',
          author: instructor.name,
        }),
      ]),
    })
  })
})
