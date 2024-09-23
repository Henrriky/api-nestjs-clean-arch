import { Slug } from '@/domain/forum/enterprise/entities/value-objects/slug'
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AttachmentFactory } from 'test/factories/make-attachments'
import { QuestionFactory } from 'test/factories/make-question'
import { QuestionAttachmentFactory } from 'test/factories/make-question-attachment'
import { StudentFactory } from 'test/factories/make-student'

describe('Get question by slug (E2E)', () => {
  let app: INestApplication
  let studentFactory: StudentFactory
  let questionFactory: QuestionFactory
  let attachmentFactory: AttachmentFactory
  let questionAttachmentsFactory: QuestionAttachmentFactory
  let jwt: JwtService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        StudentFactory,
        QuestionFactory,
        AttachmentFactory,
        QuestionAttachmentFactory,
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    studentFactory = moduleRef.get(StudentFactory)
    questionFactory = moduleRef.get(QuestionFactory)
    attachmentFactory = moduleRef.get(AttachmentFactory)
    questionAttachmentsFactory = moduleRef.get(QuestionAttachmentFactory)

    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[GET] /questions/:slug', async () => {
    const user = await studentFactory.makePrismaStudent({
      name: 'John Doe',
    })
    const accessToken = jwt.sign({ sub: user.id.toString() })

    await questionFactory.makePrismaQuestion({
      title: 'Question title',
      content: 'question content',
      authorId: user.id,
    })
    const questionToUseSlug = await questionFactory.makePrismaQuestion({
      title: 'Question title 01',
      content: 'question content 01',
      slug: Slug.create('question-01'),
      authorId: user.id,
    })

    const attachment = await attachmentFactory.makeAttachment({
      title: 'Some attachment',
    })

    await questionAttachmentsFactory.makePrismaQuestionAttachment({
      questionId: questionToUseSlug.id,
      attachmentId: attachment.id,
    })

    const response = await request(app.getHttpServer())
      .get(`/questions/${questionToUseSlug.slug.value}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      question: expect.objectContaining({
        title: questionToUseSlug.title,
        author: user.name,
        attachments: [
          expect.objectContaining({
            title: 'Some attachment',
          }),
        ],
        slug: questionToUseSlug.slug.value,
      }),
    })
  })
})
