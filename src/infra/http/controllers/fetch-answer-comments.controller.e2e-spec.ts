import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { AnswerCommentFactory } from 'test/factories/make-answer-comment'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Fetch Answer comments (E2E)', () => {
  let app: INestApplication
  let jwt: JwtService
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let answerCommentFactory: AnswerCommentFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AnswerCommentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    jwt = moduleRef.get(JwtService)
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    answerCommentFactory = moduleRef.get(AnswerCommentFactory)

    await app.init()
  })

  test('[GET] /answers/:answerId/comments', async () => {
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

    const answer = await answerFactory.makePrismaAnswer({
      content: 'This is an answer',
      authorId: instructor.id,
      questionId: question.id,
    })

    await Promise.all([
      answerCommentFactory.makePrismaAnswerComment({
        content: 'Answer comment 1',
        answerId: answer.id,
        authorId: instructor.id,
      }),
      answerCommentFactory.makePrismaAnswerComment({
        content: 'Answer comment 2',
        answerId: answer.id,
        authorId: instructor.id,
      }),
    ])

    const response = await request(app.getHttpServer())
      .get(`/answers/${answer.id}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      comments: expect.arrayContaining([
        expect.objectContaining({
          content: 'Answer comment 1',
          author: instructor.name,
        }),
        expect.objectContaining({
          content: 'Answer comment 2',
          author: instructor.name,
        }),
      ]),
    })
  })
})
