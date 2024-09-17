import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachments'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachment'
import { StudentFactory } from 'test/factories/make-student'

describe('Edit Question (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentFactory: QuestionAttachmentFactory
  let prisma: PrismaService
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        QuestionAttachmentFactory,
        AttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)
    studentFactory = moduleRef.get(StudentFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    questionAttachmentFactory = moduleRef.get(QuestionAttachmentFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[PUT] /questions/:id', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John doe',
      email: 'johndoe@example.com',
      password: await hash('123456', 8),
    })

    const question = await questionFactory.makePrismaQuestion({
      authorId: user.id,
    })

    const attachment1 = await attachmentFactory.makeAttachment()
    const attachment2 = await attachmentFactory.makeAttachment()
    const attachment3 = await attachmentFactory.makeAttachment()
    const attachment4 = await attachmentFactory.makeAttachment()

    await Promise.all([
      questionAttachmentFactory.makePrismaQuestionAttachment({
        questionId: question.id,
        attachmentId: attachment1.id,
      }),
      questionAttachmentFactory.makePrismaQuestionAttachment({
        questionId: question.id,
        attachmentId: attachment2.id,
      }),
    ])

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .put(`/questions/${question.id.toString()}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Question updated',
        content: 'question updated',
        attachments: [
          attachment2.id.toString(),
          attachment3.id.toString(),
          attachment4.id.toString(),
        ],
      })
    expect(response.statusCode).toBe(204)
    const questionOnDatabase = await prisma.question.findFirst({
      where: {
        title: 'Question updated',
        content: 'question updated',
      },
    })

    const questionAttachmentsOnDatabase = await prisma.attachment.findMany({
      where: {
        questionId: questionOnDatabase?.id,
      },
    })

    expect(questionAttachmentsOnDatabase).toBeTruthy()
    expect(questionAttachmentsOnDatabase).toHaveLength(3)
    expect(questionAttachmentsOnDatabase).toEqual(
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
    expect(questionOnDatabase).toBeTruthy()
  })
})
