import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AnswerFactory } from 'test/factories/make-answer'
import { AnswerAttachmentFactory } from 'test/factories/make-answer-attachment'
import { AttachmentFactory } from 'test/factories/make-attachments'
import { QuestionFactory } from 'test/factories/make-question'
import { StudentFactory } from 'test/factories/make-student'

describe('Edit answer (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let answerFactory: AnswerFactory
  let attachmentFactory: AttachmentFactory
  let answerAttachmentFactory: AnswerAttachmentFactory
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
        AnswerAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    answerFactory = moduleRef.get(AnswerFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    answerAttachmentFactory = moduleRef.get(AnswerAttachmentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /answers/:id', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })
    const instructor = await studentFactory.makePrismaStudent({
      name: 'John doe 2',
      email: 'johndoe2@example.com',
      password: await hash('123456', 8),
    })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })
    const answer = await answerFactory.makePrismaAnswer({
      authorId: instructor.id,
      questionId: question.id,
    })

    const attachment1 = await attachmentFactory.makeAttachment()
    const attachment2 = await attachmentFactory.makeAttachment()
    const attachment3 = await attachmentFactory.makeAttachment()
    const attachment4 = await attachmentFactory.makeAttachment()

    await Promise.all([
      answerAttachmentFactory.makePrismaAnswerAttachment({
        attachmentId: attachment1.id,
        answerId: answer.id,
      }),
      answerAttachmentFactory.makePrismaAnswerAttachment({
        attachmentId: attachment2.id,
        answerId: answer.id,
      }),
    ])

    const accessToken = jwt.sign({ sub: instructor.id.toString() })

    const response = await request(app.getHttpServer())
      .put(`/answers/${answer.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'This is a answer 2',
        attachments: [
          attachment2.id.toString(),
          attachment3.id.toString(),
          attachment4.id.toString(),
        ],
      })
    expect(response.statusCode).toBe(200)

    const answerOfQuestionOnDb = await prisma.answer.findFirst({
      where: {
        questionId: question.id.toString(),
      },
    })
    expect(answerOfQuestionOnDb).toBeTruthy()
    expect(answerOfQuestionOnDb).contains({ content: 'This is a answer 2' })

    const answerAttachmentsOnDb = await prisma.attachment.findMany({
      where: {
        answerId: answer.id.toString(),
      },
    })

    expect(answerAttachmentsOnDb).toHaveLength(3)
    expect(answerAttachmentsOnDb).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: attachment2.id.toString(),
        }),
        expect.objectContaining({
          id: attachment3.id.toString(),
        }),
        expect.objectContaining({
          id: attachment4.id.toString(),
        }),
      ]),
    )
  })
})
