import { Module } from '@nestjs/common'
import { FetchRecentQuestionsController } from './controllers/fetch-recent-questions.controller'
import { CreateAccountController } from './controllers/create-account.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CreateQuestionController } from './controllers/create-question.controller'
import { DatabaseModule } from '../database/database.module'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'
import { FetchRecentQuestionsUseCase } from '@/domain/forum/application/use-cases/fetch-recent-questions'
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { RegisterStudentUseCase } from '@/domain/forum/application/use-cases/register-student'

@Module({
  imports: [DatabaseModule, CryptographyModule], // IMPORTS PERMITE ACESSO DE TODOS OS SERVICES EXPORTADOS PELO MODULO SEM PRECISAR ESPECIFICAR NO PROVIDERS DO ATUAL.
  controllers: [
    FetchRecentQuestionsController,
    CreateAccountController,
    AuthenticateController,
    CreateQuestionController,
  ],
  providers: [
    CreateQuestionUseCase,
    FetchRecentQuestionsUseCase,
    AuthenticateStudentUseCase,
    RegisterStudentUseCase,
  ],
})
export class HttpModule {}
