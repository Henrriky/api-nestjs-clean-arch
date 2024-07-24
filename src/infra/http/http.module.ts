import { Module } from '@nestjs/common'
import { FetchRecentQuestionsController } from './controllers/fetch-recent-questions.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { PrismaService } from '../database/prisma/prisma.service'
import { DatabaseModule } from '../database/database.module'

@Module({
  imports: [DatabaseModule], // IMPORTS PERMITE ACESSO DE TODOS OS SERVICES EXPORTADOS PELO MODULO SEM PRECISAR ESPECIFICAR NO PROVIDERS DO ATUAL.
  controllers: [
    FetchRecentQuestionsController,
    CreateAccountController,
    AuthenticateController,
    CreateQuestionController,
  ],
  providers: [PrismaService],
})
export class HttpModule {}
