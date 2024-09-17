import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { AttachmentFactory } from 'test/factories/make-attachments'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Answer Question (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let attachmentFactory: AttachmentFactory
  let questionFactory: QuestionFactory
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AnswerFactory,
        AttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /questions/:id/answers', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const attachment1 = await attachmentFactory.makeAttachment()
    const attachment2 = await attachmentFactory.makeAttachment()

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post(`/questions/${question.id.toString()}/answers`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'This is a answer',
        attachments: [attachment1.id.toString(), attachment2.id.toString()],
      })
    expect(response.statusCode).toBe(201)

    const answerOfQuestionOnDb = await prisma.answer.findFirst({
      where: {
        questionId: question.id.toString(),
      },
    })
    expect(answerOfQuestionOnDb).toBeTruthy()
    expect(answerOfQuestionOnDb).contains({ content: 'This is a answer' })

    const answerAttachmentsOnDb = await prisma.attachment.findMany({
      where: {
        answerId: answerOfQuestionOnDb?.id,
      },
    })

    expect(answerAttachmentsOnDb).toHaveLength(2)
  })
})
