# Projeto com NestJS

- Quick AI: MacOS Extension
- Modelo C4 (Context, Containers, Components, Code Diagram)

## Criando projeto com NestJS

- `nest new <project-name>`
- Remover prettierrc e eslintrc
- Remover tudo que tem em test
- Remover spec.ts
- Remover scripts de test em package.json
- Remover configurações do Jest em package.json

## Module, Service, Controller

- Decorator: Uma função "mágica" que modifica comportamento padrão de uma outra função ou recurso usado

### Controllers

- Porta de entrada da aplicação
  - Utiliza o Decorators para mapear que a classe é um controller utilizando `@Controller('/api')`
  - Utiliza Decorators para mapear rotas da aplicação baseado nas funções, como:
    - `@Get('/hello')`
    - `@Post('/hello')`
    - `@Put('/hello')`
    - `@Patch('/hello')`
    - `@Delete('/hello')`
  - Utiliza `Dependency Inversion` para realizar a inversão da dependência em uma classe, permitindo o acesso de services da aplicação
    - O service ou quaisquer outras classes da aplicação são recebidos via propriedade no construtor
    - O service pode ser acessado a partir do `this.serviceName`

### Modules

- Agrupa todas as dependências referentes ao módulo
- Os módulos são arquivos que agrupam `Services`, `Controllers` e `Outros componentes` da aplicação. 
  - Por exemplo, um modelo poderia importar services de Banco de Dados, Conexão com API, Serviços de Mensageria, Serviços de monitoramento, Serviço de Background Job etc.
- Existem algumas coisas que um módulo pode fazer:
  1. Pode importar outros Modules através do atributo `imports`
    - Importar outros módulos permite que a gente seja capaz de utilizar os serviços estão disponíveis nele.
  2. Pode importar Controllers através do atributo `controllers`
  3. Pode importar Services através do atributo `providers`
- O `AppModule` é raiz do projeto que puxa todos os outros módulos, não pode ser excluido, pois é utilizado pelo `NestFactory.create`, que é a fábrica de startup da nossa aplicação na função `bootstrap()`
- Utiliza o decorator `@Module` em cima da classe de módulo, que recebe um objeto com alguns parâmetros: Imports, Controllers, Providers
  - `controllers`: Todos controllers que existem dentro desse Module
  - `providers`: Todas as dependências que os controllers possuem (Services, UseCases, Banco de Dados, Mailers, Publisher).
    - Para que a injeção de dependência ocorra no `Controller` que esteja solicitando um determinado `Service`, é necessário utilizar o decorator `Injectable()` acima do `Service` que será utilizado. Esse decorator indica que um Service é injetável em outras classes.

### Services

- São serviços que encapsulam uma determinada lógica e podem ser reutilizados por todo o projeto através da injeção de dependência nos Controllers e que devem ser chamados como providers no Modules.
- Além disso, podem receber decorators como `Injectable()`, que vai permitir que o Serviço seja injetado em Controllers ou até mesmo em outros services.

## Configurando Eslint + Prettier
   
- `pnpm i eslint @rocketseat/eslint-config -D`: Importar configurações da Rocketseat para o Eslint, que é uma ferramenta para padronização do estilo da escrita do código e que pode ser extendida de configurações personalizadas.
- Após instalar é necessário extender a configuração do eslint para a da Rocketseat, criando o arquivo `.eslintrc`
- Executar `npm run lint` para corrigir todos os erros
- Opcional: Configurar auto lint quando salvar o arquivo

## Configurando Docker

- Configurar Docker Compose para Banco de Dados
  - Em produção é recomendado as imagens da Bitnami, que adicionam uma camada a mais de segurança: `bitnami/postgres`
  - Em desenvolvimento podemos usar a oficial mesmo: `postgres`
  ```yaml
  version: '3'

  services:
    postgres:
      container_name: nest-clean-pg
      image: postgres
      ports:
        - 5440:5432
      environment:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: docker
        POSTGRES_DB: nest-clean
        PGDATA: /data/postgres
      volumes:
        - ./data/pg:/data/postgres
  ```
- Executar o docker `docker compose up -d`
- Utilizar alguma ferramenta para acessar o postgres, como Postico ou PgADMIN

## Configurando prisma

- Instalar a CLI do Prisma como desenvolvimento `pnpm install prisma -D`
  - Executar comandos como `prisma init`
- Instalar o Client do Prisma como produção: `pnpm install @prisma/client`
- Executar `prisma init` e seguir os passos recomendados:
  1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
  2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
  3. Run `prisma migrate dev` to turn your prisma schema into your database or use `prisma db pull` to inverse.
  4. Run `prisma generate` to generate the Prisma Client. You can then start querying your database.
- Agora vamos configurar nosso schema
- Executar `prisma migrate dev` para enviar as alterações para o banco de dados
- Executar `prisma studio` para visualizar o banco de dados

### Configurando o serviço do Prisma para o NestJS

- Num projeto comum, nós iriamos criar um arquivo `prisma.ts` e exportar o prisma client, no entanto, como estamos trabalhando com NestJS, vamos aproveitar a funcionalidade que ele tem de inversão de dependência
- Criar arquivo `src/prisma/prisma.service.ts` com `@Injectable()`
  - Utilizar contratos do NestJS `OnModuleInit` e `OnModuleDestroy`, que permite ao NestJS chamar os dois métodos definidos no service quando o modulo que usa o prisma service for destruido ou iniciado.
- Importar o Service no `AppModule` em `providers`. Depois disso, todos os métodos dentro de PrismaService será acessível para os controladores que injetarem o Serviço do Prisma como dependência

## Controller de criação de conta

- Personalizar icones
    "symbols.files.associations": {
        "*.module.ts": "nest",
        "*.guard.ts": "typescript",
        "*.spec.ts": "ts-test",
        "*.e2e-spec.ts": "ts-test",
        "vitest.config.e2e.ts": "vite"
    },
- Separar cada rota em um Controller independente, como `create-account.controller.ts` ao invés de `account.controller.ts` que agrupa todas as operações.
  - Vamos utilizar o decorator `Post()` para indicar que existe um manipulador que vai ser chamado quando POST /accounts for chamado
  - Vamos também utilizar `Body() body: any` para receber o Body da requisição como parâmetro da função e criar nosso usuário com o Prisma
  - Enviar uma requisição para criação de uma conta `http POST localhost:3000/accounts name=Henrriky email=henrriky@gmail.com password=123456`, passa como JSON
  - Criar verificação se um email existe ou não, previnindo erros na aplicação. Para isso, caso exista um usuário com o mesmo email do que está sendo enviado, podemos disparar um erro do próprio NestJS, chamado de `ConflictException`, que automaticamente retorna a seguinte mensagem:
    ```ts
    {
      "error": "Conflict",
      "message": "User with same e-mail",
      "statusCode": 409
    }
    ```
- Código completo:
  ```ts
  import {
    ConflictException,
    Body,
    Controller,
    HttpCode,
    Post,
  } from '@nestjs/common'
  import { PrismaService } from '@/prisma/prisma.service'

  @Controller('/accounts')
  export class CreateAccountController {
    constructor(private prisma: PrismaService) {}

    @Post()
    @HttpCode(201)
    async handle(@Body() body: any) {
      const { name, email, password } = body

      const userWithSameEmail = await this.prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (userWithSameEmail) {
        throw new ConflictException(
          'User with same e-mail address already exists.',
        )
      }

      await this.prisma.user.create({
        data: {
          name,
          email,
          password,
        },
      })
    }
  }
  ```
### Gerando Hash da Senha

- `pnpm install @types/bcryptjs -D`
- `pnpm install bcryptjs`
- Utilizar função de dentro do bcrypt `hash` passando a senha e salvando o hash no banco

## Pipe de validação com Zod

- Vamos utilizar a biblioteca do Zod para realizar a validação dos nossos dados, para isso `pnpm i zod`
- Criar Schema e o DTO:
  ```ts
    const createAccountBodySchema = z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
    })

    type CreateAccountSchema = z.infer<typeof createAccountBodySchema>
  ```
- Ao invés de criar um try, catch para todas as rotas que possuirem validação e retornar BadRequest para cada uma, é mais fácil criarmos algum mecanismo para realizar um handle de erro do Zod de forma Global.
- Para fazer isso, vamos utilizar `Pipes`, que é um conceito do NestJS que são como se fossem `Middlewares` que servem para interceptar algo, como o body de uma request ou até mesmo um erro.
- No nosso caso vamos interceptar e validar a entrada de dados do nosso Controller

### Criando o Pipe

- Criar uma pasta `/pipes/zod-validation-pipe.ts`
- Implementar a interface `PipeTransform` do NestJS
```ts
import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      this.schema.parse(value)
    } catch (error) {
      throw new BadRequestException('Validation failed')
    }

    return value
  }
}
```
- Agora vamos importar nosso `ZodValidationPipe` no `CreateAccountController` através do decorator `UsePipes(new ZodValidationPipe(createAccountBodySchema))` no nosso handler
- Instalar `pnpm install zod-validation-error`, que deixa os erros do zod mais legiveis usando `fromZodError`

## Usando ConfigModule para as variáveis de ambiente

- Para fazer essa validação com as variáveis de ambiente no NestJS vamos usar o conceito de `ConfigModule`:
  - Baixar: `pnpm i @nestjs/config`
  - Criar env.ts
  ```ts
  export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().optional().default(3333),
  })

  export type env = z.infer<typeof envSchema>

  //app.module.ts
  @Module({
    imports: [
      ConfigModule.forRoot({
        validate: (env) => envSchema.parse(env),
        isGlobal: true,
      }),
    ],
    controllers: [CreateAccountController],
    providers: [AppService, PrismaService],
  })
  export class AppModule {}

  ```
  - Agora importar o ConfigModule dentro do AppModule, passando o schema de validação e dizendo que ele será um módulo global, para que os outros modulos não tenham que importar ele explicitamente. Teremos acesso das variaveis de ambiente utilizando um `ConfigService` com inversão de dependencia no contrutor dos serviços ou controllers

## Configurando Autenticação JWT

- Criar módulo de autenticação: `auth.module.ts` e importar ele no módulo principal
- `npm i @nestjs/passport @nestjs/jwt` 
  - PassportJS: Biblioteca para autenticação usado no Express, Fastify, NestJS entre outros. A ideia principal dele é automatizar fluxos de autenticação, como OAuth 2.0, OpenID, SAML, OAuth 2.0 Multitenant entre outros protocolos, abstraindo complexidades que apenas se repetem com a implementação desses protocolos. No nosso caso vamos utilizar a estratégia "Passport-jwt"
- Vamos configurar no `AuthModule` a importação de mais dois outros módulos `PassportModule` e `JwtModule`.
  - Será necessário registrar o JwtModule passando algumas variáveis, como o Secret. No entanto, atualmente só sabemos que é possível utilizar o ConfigService.get como uma provider injetavel. Para utilizar Services na configuração de um módulo, é preciso utilizar `registerAsync` no `JwtModule` passando uma lista de serviços para o atributo `inject`, que vai permitir a injeção de Serviços enquanto o JwtModule está sendo registrado.
  - Além disso, vamos passar o tipo de algoritmo do JWT, que será o RS256. Esse algoritmo permite a utilização de chaves publicas para que outros microserviços possam validar um token do usuário.

### Gerando token JWT

- Para gerar um token JWT precisaremos primeiro gerar nossa chave privada e publica
  - `openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048`
  - `openssl rsa -pubout -in private_key.pem -out public_key.pem`
- Após gerar as chaves vamos carregar elas no .env e definir a validação em env.ts. Além disso, vamos criar um `AuthenticateController` que vai utilizar o `JwtService` que vem do `JwtModule` que está sendo importado no `AuthModule`, que consequentemente é importado pelo `AppModule`

```ts
//AuthModule -> (PassportModule, JwtModule)
@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory(config: ConfigService<env, true>) {
        const privateKey = config.get('JWT_PRIVATE_KEY')
        const publicKey = config.get('JWT_PRIVATE_KEY')

        return {
          signOptions: { algorithm: 'RS256' },
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
        }
      },
    }),
  ],
})
export class AuthModule {}

//AppModule -> (AuthModule  (PassportModule, JwtModule), ConfigModule)
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [CreateAccountController, AuthenticateController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
```
- Quando importamos um modulo dentro de outro modulo, todos os modulos importados pelo modulo importado são levados juntos, tal como os providers e controllers.

### Protegendo rotas com Guards

- Os Guards nos NestJS são utilizados para mapear rotas que deverão ser protegidas com autorização via JWT ou qualquer outro tipo de Guard.
- Para isso, vamos configurar primeiramente nossa Strategy (que serve para validar que o usuário está logado e não para criar):
```ts
const tokenSchema = z.object({
  sub: z.string().uuid(),
})

type TokenSchema = z.infer<typeof tokenSchema>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<env, true>) {
    const publicKey = config.get('JWT_PUBLIC_KEY', { infer: true })

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    })
  }

  async validate(payload: TokenSchema) {
    return tokenSchema.parse(payload)
  }
}
```
- Cadastrar o `JwtStrategy` no `AuthModule` em `providers`
- Usar o `@UseGuards(AuthGuard('jwt'))` no controller


## Configurando Vitest + SWC

- Padrão: feita com o typescript (tsc)
- SWC: Plataforma para compilação de código typescript para javascript mais rápdi
  - SWC (Fast compiler) da documentação do NestJS
  - `pnpm install vite-tsconfig-paths -D`: Utilizar alias para importação absoluta a partir da raiz
  - Criar `vitest.config.e2e.ts` e `vitest.config.ts`

## Banco de dados isolado nos testes

- Nos testes E2E não devemos mockar o banco de dados, o ideal é ser o mais próximo possível do ambiente de produção.
- É sempre importante realizar o fluxo completo da nossa aplicação, devemos ter um banco de dados isolado para cada teste E2E que for rodar, para que não ocorra conflitos na hora que outro teste estiver rodando.
- Cada teste tera um banco de dados zerado.
  - Criar arquiv `setup-e2e.ts`, que será chamado antes de cada teste
  - Adicionar o arquivo em `setupFiles` no `vitest.config.e2e.ts`
  ```ts
  import { PrismaClient } from '@prisma/client'
  import { execSync } from 'child_process'
  import { randomUUID } from 'crypto'
  import 'dotenv'

  const prisma = new PrismaClient()

  function generateUniqueDatabaseUrl(schemaId: string) {
    if (!process.env.DATABASE_URL) {
      throw new Error('Please provide a DATABASE_URL enviroment variable.')
    }

    const url = new URL(process.env.DATABASE_URL)

    url.searchParams.set('schema', schemaId)

    return url.toString()
  }

  beforeAll(async () => {
    const databaseURL = generateUniqueDatabaseUrl(randomUUID())

    process.env.DATABASE_URL = databaseURL

    execSync('pnpm prisma migrate deploy')
  })

  afterAll(async () => {})
  ```
- Após isso, quando os testes forem rodar cada um deles terá uma URL do banco de dados diferente. Se usarmos alguma ferramenta de gerenciamento de banco de dados vamos poder visualizar de que o banco de dados da aplicação possui o schema dos testes.

## Testes E2E de usuários

- `pnpm i supertest @types/supertest -D`
```ts
import { AppModule } from '@/app.module'
import { PrismaService } from '@/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

describe('Create Account (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  test('[POST] /accounts', async () => {
    const response = await request(app.getHttpServer()).post('/accounts').send({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(response.statusCode).toBe(201)

    const userOnDatabase = await prisma.user.findUnique({
      where: {
        email: 'johndoe@example.com',
      },
    })

    expect(userOnDatabase).toBeTruthy()
  })
})
```

## Entendendo camadas

- 1. Camada azul (mais externa): Também chamada de `infra`
  - Interage com o mundo externo (usuário, banco de dados)
  - Devices: Android
  - External Interfaces: API's de envio de email
  - Web: API Rest, HTTP
  - UI: Front-end
  - DB: Prisma
- 2. Camada verde: Também conhecida de `gateways`, `presenters`, `controllers`
  - Adaptam as requisições/comunicação que acontece entre o mundo externo e as camadas mais internas
  - Controllers: Recebem as requisições HTTP
  - Presenters: Adaptam as respostas para a camada mais externa
  - Gateways: Adaptam as camadas mais externas para que as camadas mais internas possam conversar com eles sem depender da implementação
- 3. Camada vermelha e amarela: Também conhecida de `domain`, `business`, `enterprise`
  - Aqui fica todo o código desacoplado de qualquer framework, que expressa a linguagem e os modelos do negócio, respeitando suas fronteiras e relacionamentos, tal como os objetos de valor.
  - Toda comunicação dessa camada com uma exterior deve ser feita através de `Adapters ou Gateways`
  - Use cases
  - Entities
  - Value Objects
- Exemplo:
  HTTP (INFRA)
    --> CONTROLLERS (ADAPTERS, GATEWAYS)
      --> USE CASE (DOMAIN)
        --> ENTITIES
        --> Repositories (Gateways)
          --> Prisma (Infra)
            --> Presenter (Adapter, Gateway)
              --> HTTP Response

## Criando camada de infra

- src/domain: Domínio do negócio
- src/core: Entidades e Objetos compartilhados no domínio do negócio, poderia se chamar shared
- src/infra: Camada do NestJS
  - Framework (NestJS), Banco de Dados, Infra
  - http
    - controllers
    - pipes
  - auth
  - prisma
  - auth, controllers, pipes, prisma, env, nestjs

### Criando repositories

- Para criar repositories vamos primeiro criar um modulo de banco de dados `database.module.ts`
- Esse modulo vai utilizar o PrismaService, então devemos importar ele através de `providers: [PrismaService]`;
- Se quisermos que outros modulos que importarem o nosso sejam capazes de acessar o `PrismaService` será necessário utilizar `exports: [PrismaService]`
- Agora basta implementar a interface dos casos de uso que funcionam como Gateways para camadas externas como o nosso banco de dados utilizando o PrismaORM

### Conversa entre camadas (mapppers)

- Existem dois tipos de questions, as do banco de dados e a do domínio. É extremamente comum a gente ter representações diferentes de uma mesma entidade em diferentes camadas.
```ts
export class PrismaQuestionMapper {
  static toDomain(raw: PrismaQuestion): Question {
    return Question.create(
      {
        title: raw.title,
        content: raw.content,
        authorId: new UniqueEntityID(raw.authorId),
        bestAnswerId: raw.bestAnswerId
          ? new UniqueEntityID(raw.bestAnswerId)
          : null,
        slug: Slug.create(raw.slug),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(question: Question): Prisma.QuestionUncheckedCreateInput {
    return {
      id: question.id.toString(),
      authorId: question.authorId.toString(),
      bestAnswerId: question.bestAnswerId?.toString(),
      title: question.title,
      slug: question.slug.value,
      content: question.content,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }
  }
}
```

### Criando schema do Prisma

```prisma
enum UserRole {
  STUDENT
  INSTRUCTOR
}

model User {
  id        String     @id @default(uuid())
  name      String
  email     String     @unique
  password  String
  role      UserRole   @default(STUDENT)
  questions Question[]

  @@map("users")
}

model Answer {
  id        String    @id @default(uuid())
  content   String
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime? @updatedAt @map("updated_at")
  authorId  String    @map("author_id")

  author User @relation(fields: [authorId], references: [id])

  @@map("answers")
}
```
- `pnpm prisma migrate dev`

### Comunicação entre camadas

- Para utilizar o `CreateQuestionUseCase` no `CreateQuestionController` é necessário:
  1. Receber `CreateQuestionUseCase` no construtor de `CreateQuestionController`
  2. Alternativas para injetar `CreateQuestionUseCase` no `CreateQuestionController`
    - Alternativa que vai ferir a Clean Architecture: Usar `@Injectable()` em uma camada de domínio, que deve ser livre de frameworks.
    - Alternativa sem sujar a camada de domínio:
      - Criar um `nest-create-question-use-case.ts` e criar uma classe que extende `CreateQuestionUseCase` que usa o `Injectable()`
  3. Agora basta adicionar `CreateQuestionUseCase` que virou um service como um provider de `HttpModule` para que `CreateQuestionController` tenha acesso
  4. Resolver problema de que o NestJS não consegue entender uma interface como Injeção de dependência
    - No NestJS a injeção de dependência acontece na execução da aplicação que está em JS.
    - Alterar de interfaces para classes abstratas e transformar os métodos para abstratos
    - No DatabaseModule utilize provide e useClass nos providers
    ```ts
    providers: [
      {
        provide: QuestionsRepository,
        useClass: PrismaQuestionsRepository,
      },
    ],
    ```

### Presenters

- Os presenters na Clean Arch são componentes da aplicação que possuem a responsabilidade de converter o que temos da camada de domínio para a camada HTTP.
  - No cenário atual estamos trabalhando apenas com o protocolo HTTP, mas caso a gente fosse trabalhar com outros deveriamos colocar um prefixo em cada presenter
  - Nós poderiamos definir alguns presenters na onde omitiria algum atributo para diminuir o payload carregado pela rede.

## Caso de uso: Autenticar e Registrar Estudante

### Gateways de Criptografia

- Criação de conta utiliza um `Serviço de Criptografia` para criar o hash
- Realização do login utiliza um `Serviço de Criptografia` para comparar a senha enviada com o hash
- O ideal é abstrair esse `Serviço de Criptografia` para um `Contract/Port/Adapter`, onde cada biblioteca terá sua implementação especifica.
- O `Serviço de Criptografia` pertence a camada de infraestrutura. No nosso caso já temos algo parecido, com o `Repository` atuando como um Adapter entre o caso de uso e o banco de dados (Gateway, Proxy, Adapter ou outros nomes)
```ts
export abstract class Encrypter {
  abstract encrypt(payload: Record<string, unknown>): Promise<string>
}
export abstract class HashComparer {
  abstract compare(plain: string, hash: string): Promise<boolean>
}
export abstract class HashGenerator {
  abstract hash(plain: string): Promise<string>
}
```

#### Stubs de criptografia

- Criação de algo irreal feito apenas para os testes
```ts
export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }
}
export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload)
  }
}
```

#### Implementação de criptografia

```ts
export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGHT = 8

  async hash(plain: string): Promise<string> {
    const hashedPassword = await hash(plain, this.HASH_SALT_LENGHT)

    return hashedPassword
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    const passwordMatchWithHash = await compare(plain, hash)

    return passwordMatchWithHash
  }
}

export class JwtEncrypter implements Encrypter {
  constructor(private readonly jwt: JwtService) {}

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    const accessToken = this.jwt.sign({
      payload,
    })

    return accessToken
  }
}
```

### Criação dos controllers

- Criar implementação de `StudentsRepository` e criação do mapper `PrismaStudentMapper`
- Tratamento de erro correto:
```ts
    if (result.isFailure()) {
      const error = result.value
      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
```

## Rotas privadas por padrão

- Definir apenas as rotas que não precisam de autenticação
- Usar a constante APP_GUARD, que é uma maneira de definir um Guard de maneira global

## Finalizando Schema Prisma

```prisma
model Comment {
  id         String    @id @default(uuid())
  content    String
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime? @updatedAt @map("updated_at")
  authorId   String    @map("author_id")
  questionId String?   @map("question_id")
  answerId   String?   @map("answer_id")

  author   User      @relation(fields: [authorId], references: [id])
  question Question? @relation(fields: [questionId], references: [id])
  answer   Answer?   @relation(fields: [answerId], references: [id])

  @@map("comments")
}

model Attachment {
  id         String  @id @default(uuid())
  title      String
  url        String
  questionId String? @map("question_id")
  answerId   String? @map("answer_id")

  question Question? @relation(fields: [questionId], references: [id])
  answer   Answer?   @relation(fields: [answerId], references: [id])

  @@map("attachments")
}
```

## Criando Mappers do Prisma


- As camadas da aplicação são componentes separados um dos outros.
- Não necessariamente uma classe/entidade da camada do domínio representa uma tabela no banco de dados.
- 414 -> Implementando Repositorios

## Implementando repositórios

## Utilizando Factories nos Testes E2E

## Refatorando E2E

## Criando os controllers

### Controladores de Pergunta

#### Editar pergunta

#### Deletar pergunta

#### Responder pergunta

#### Editar resposta da pergunta

#### Deletar resposta da pergunta

#### Buscar respostas de uma pergunta

- Buscar também o autor da resposta através do id.
- Criar um Presenter sem o autor, posteriormente essa informação deverá ser buscada.

#### Escolher melhor resposta

#### Comentar na pergunta

#### Deletar Comentário da pergunta

### Controllers de Resposta

- [x] Comentar na resposta
- [X] Deletar comentário da resposta
- [X] Listar comentários de uma pergunta
- [X] Listar comentários de uma resposta

### Controller de Upload de Arquivo

- Rota de Upload de Arquivos -> Retorna o ID do Arquivo que foi realizado o Upload -> Envia o ID do Arquivo que foi realizado o Upload
- Sempre separar a lógica de Upload de arquivos, pois o envio dele através do json em base64 pode sobrecarregar o payload enviado para a API.
- [ ] Controller de realizar o upload de anexos
  - Utilizar o `pnpm install @types/multer`
  - Adicionar um `@UseInterceptors()` e `@FileInterceptor('file')`
  ```ts
    @Controller('/attachments')
    export class UploadAttachmentsController {
      @Post()
      @HttpCode(201)
      @UseInterceptors(FileInterceptor('file'))
      async handle(
        @UploadedFile(
          new ParseFilePipe({
            validators: [
              new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }), // 2 MB
              new FileTypeValidator({ fileType: '.(png|jpg|jpeg|pdf)' }),
            ],
          }),
        )
        file: Express.Multer.File,
      ) {
      }
    }
  ```
  - `http --form POST localhost:3333/attachments file@profile.png`

#### Use case de Upload de Arquivo

- Formas de Upload de arquivo: Buffer, Base64, Stream, Arquivo temporário entre outros
- [X] Use case UploadAndCreateAttachment
  - [X] Receber o Buffer do arquivo em memória HEAP
    - Alternativa é o recebimento de uma Stream, que o multer também suporta `internal.Readable`
  - [X] Validação do tipo de arquivo para que seja enviado o tipo de arquivo para algum Storage Provider (AWS S3, Cloudflare R2)

#### Testes unitários para o Use Case de Upload

```ts
import { expect, it, describe, beforeEach } from 'vitest'
import { InMemoryAttachmentsRepository } from 'test/repositories/in-memory-attachments-repository'
import { UploadAndCreateAttachmentUseCase } from './upload-and-create-attachment'
import { FakeUploader } from 'test/storage/fake-uploader'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type'

let inMemoryAttachmentsRepository: InMemoryAttachmentsRepository
let fakeUploader: FakeUploader
let usecase: UploadAndCreateAttachmentUseCase

describe('Upload and Create Attachment', () => {
  beforeEach(() => {
    inMemoryAttachmentsRepository = new InMemoryAttachmentsRepository()
    fakeUploader = new FakeUploader()
    usecase = new UploadAndCreateAttachmentUseCase(
      inMemoryAttachmentsRepository,
      fakeUploader,
    )
  })

  it('should be able to upload and create an attachment', async () => {
    const result = await usecase.execute({
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      attachment: inMemoryAttachmentsRepository.items[0],
    })
    expect(fakeUploader.uploads).toHaveLength(1)
    expect(fakeUploader.uploads[0]).toEqual(
      expect.objectContaining({
        fileName: 'profile.png',
      }),
    )
  })

  it('should be able to upload an attachment with invalid file type', async () => {
    const result = await usecase.execute({
      fileName: 'profile.png',
      fileType: 'audio/mpeg',
      body: Buffer.from(''),
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidAttachmentTypeError)
  })
})
```

#### Integração com Cloudflare R2

- Existem vários Storage Providers que suportam o upload de arquivos através das aplicações. Alguns exemplos são: Amazon S3, Tebi S3, Cloudflare R2.
  - Salvar nesses sistemas de armazenamento é mais barato que armazenar no disco da máquina
  - Amazon obriga a colocar o cartão de crédito pra utilizar o serviço do S3 e cobra a taxa de egress (saída para internet)
  - O Cloudflare R2 também é feito para o armazenamento de objetos e não cobra por taxa de egress. Além disso, ele tem suporte para API da Amazon S3.
  - Criar conta -> R2 -> Criar um Bucket (Pasta do Projeto) -> Selecionar a região -> Criar
    - Manage R2 API Tokens -> Create API Token -> Type API Token Name -> Define permissions -> Specify buckets -> Define TTL 
      - Copy Access Key ID and Secret Access Key  
      - Definir na variável de ambiente
      ```env
        AWS_SECRET_ACCESS_KEY="123123123123"
        AWS_ACCESS_KEY_ID="123123123"
        AWS_BUCKET_NAME="ASDADASD"
        CLOUDFLARE_ACCOUNT_ID="asdasdasdasd"
      ```
      - Validar variáveis de ambiente
- `pnpm install @aws-sdk/client-s3`
- Criar `r2-storage.ts`
- Nunca salvar a url no banco de dados, melhor salvar a referência para o id do arquivo que retorna a url, pois se o storage alterar a url também se altera.

#### Criando testes para o Controller de criação de anexo

- Não se deve "mockar" os dados quando estiver trabalhando com testes E2E. Por exemplo, na Cloudflare, os testes E2E vai de fato criar os dados lá, para que seja possível simular ao máximo o ambiente de produção.
- Criar bucket dedicado para testes
  - Adicionar lifecycle de deletar os objetos após um dia de criação.
- Criar .env.test
- Adicionar um bucket diferente para testes.
config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

- Sempre isolar os testes

## Refatorando controllers

### Perguntas com anexos

- Em nenhum momento o `QuestionRepositoryPrisma#create` está criando os Attachments no banco de dados.
  - Esses dados estão salvos apenas no modelo de domínio, que foi extraido apenas os atributos da entidade no Mapper.
- Agreagado: Conjunto de entidades que caminham juntas
  - Uma Question tem vários Attachments
  - Question (AggregateRoot) e Attachments está dentro do agregado.
  - Quando vamos salvar o `AggregateRoot` é importante que as informações como lista de anexos sejam salvas junto ao salvamento da `Question` no banco de dados.
  - Vamos criar dois métodos no `QuestionAttachmentsRepository` que é create e delete. Esses métodos vão atualizar a coluna questionId, pois estamos pressupondo que os attachments que estão sendo enviados para esse método já foram adicionados na tabela, e agora só basta relacionar eles com o questionId.
- Ao trabalhar com arquitetura em camadas, sempre temos que pensar que não necessariamente as ações fazem um mapeamento de 1 para 1 entre camadas de domínio e camada de infra/persistência. Pode ser que estamos criando uma informação na camada de domínio e quatro registros em tabelas do banco de dados.
- Nesse caso um Repositorio do AggregateRoot chama o repositorio dos agregados filhos:
```ts
  async create(question: Question) {
    this.items.push(question)

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems(),
    )

    DomainEvents.dispatchEventsForAggregate(question.id)
  }

  async save(question: Question) {
    const itemIndex = this.items.findIndex((item) => item.id === question.id)

    this.items[itemIndex] = question

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getNewItems(),
    )

    await this.questionAttachmentsRepository.deleteMany(
      question.attachments.getRemovedItems(),
    )

    DomainEvents.dispatchEventsForAggregate(question.id)
  }
```

### Persistindo anexos no banco do prisma

- O correto era criar os anexos apenas se a questão for criada, através de transactions. No entanto, o prisma possui uma limitação nas transactions, que você não pode executar uma transaction que englobe mais de um arquivo. 

### Criando perguntas com anexos

- Criar previamente os anexos para realizar os testes E2E

### Editando perguntas com anexos

- Necessário criar anexos relacionados a pergunta que será editada
- Enviar anexos que não estão no banco, forçando a inferência de que os novos foram criados e os antigos foram deletados.

### Criando respostas com anexos

- Criação de `createMany` e `deleteMany` do `AnswerAttachment`

### Editando respostas com anexos

- Criação dos testes unitários para `edit-answer.ts`
- Criação da camada de infra:
  - [X] Alterar `PrismaAnswerRepository` e `PrismaAnswerAttachmentsRepository`
    - [X] Criar para `PrismaAnswerAttachmentsRepository` os métodos `createMany` e `deleteMany`
    - [X] Adicionar para `PrismaAnswerRepository` chamda para os métodos `createMany` e `deleteMany`
  - [X] Receber anexos em `EditAsnwerQuestionController`
  - [X] Receber anexos em `AnswerQuestionController`
  - [X] Criar `AnswerAttachmentsFactory` para persistência no Prisma para os testes E2E
  - [X] Realizar testes para `AnswerQuestionController`
  - [X] Realizar testes para `EditAsnwerQuestionController`

### Dados relacionados a uma API Rest.

- Ao listar as perguntas de um fórum, o front-end normalmente não vai precisar somente do id do autor, e sim do nome dele. No entanto, realizar outra requisição para buscar o nome do autor com o id não é uma prática muito boa. Por isso, às vezes se torna necessário utilizar um Presenter que traz todos os dados em uma única requisição e que o front-end vai precisar.
- Além disso, é recomendável sempre dividir uma requisição para um recurso (perguntas) e outra para uma grande quantidade de recursos associados, como respostas.
- GraphQL: Diminui o desperdício e falta de dados, permitindo que o front-end faça solicitação do que apenas é necessário para construir, gerando menos dados e overhead na rede.
- API Rest: Possui dois problemas, que são overfetching (muita informação) e underfetching (poucos dados)
  - Maior payload -> Maior bytes -> Maior quantidade de dados trafegados -> Maior latência -> Maior tempo para realizar o parse do JSON.

### Value Object comentário com Author

- Agora queremos fazer rotas na aplicação que não retornam dados apenas de uma entidade, assim como nossos repositorios estavam fazendo, e sim de várias entidades juntas.
- Ou seja, vamos retorna estrutura de dados que são compostas de outras estruturas de dados.
- Entidade da camada de domínio: tudo que consiguimos idenficar de forma individual através de algum identificador.
- Logo, se vamos retornar uma informação de `Answer` com `Author`, nós não vamos ter uma entidade e sim um aglomerado de informações.
- Para representar esses aglomerados, vamos utilizar os `Value Objects`, que são classes que a gente identifica a individualidade da classe através do valor dos seus atributos. Se queremos listar perguntas com o autor, precisamos representar isso através de `Value Objects`

```ts
import { ValueObject } from '@/core/entities/value-object'

export interface CommentWithAuthorProps {
  commentId: string
  content: string
  author: string
  authorId: string
  createdAt: Date
  updatedAt?: Date | null
}

export class CommentWithAuthor extends ValueObject<CommentWithAuthorProps> {
  get commentId() {
    return this.props.commentId
  }

  get content() {
    return this.props.content
  }

  get author() {
    return this.props.author
  }

  get authorId() {
    return this.props.authorId
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  static create(props: CommentWithAuthorProps) {
    return new CommentWithAuthor(props)
  }
}
```
- [X] Alterar `fetch-question-comments` para retornar o `Value Object`: `CommentWithAuthorProps`

### Listando comentário com Autor

- Modificar o `QuestionCommentsRepository`
```ts
  abstract findManyByQuestionIdWithAuthor(
    questionId: string,
    params: PaginationParams,
  ): Promise<CommentWithAuthor[]>
```
- Quando estivermos lidando com InMemoryRepository, toda dependência será um repositorio em memoria também.
- Receber o inMemoryStudentsRepository como dependência e utilizar diretamente os items para evitar a criação de varios metodos
```ts

  async findManyByTopicIdWithAuthor(
    questionId: string,
    params: PaginationParams,
  ): Promise<CommentWithAuthor[]> {
    params.page = Math.max(1, params.page)
    const limit = 10
    const previousOffset = (params.page - 1) * limit
    const finalOffset = params.page * limit

    const questionComments = this.items
      .filter((item) => item.questionId.toString() === questionId)
      .slice(previousOffset, finalOffset)
      .map((comment) => {
        const author = this.studentsRepository.items.find((student) => {
          return student.id.equals(comment.authorId)
        })

        if (!author) {
          throw new Error(
            `Author with ID "${comment.authorId.toString()}" does not exist.`,
          )
        }
        return CommentWithAuthor.create({
          commentId: comment.id,
          author: author.name,
          authorId: comment.authorId,
          content: comment.content,
          updatedAt: comment.updatedAt,
          createdAt: comment.createdAt,
        })
      })

    return questionComments
  }
```

### Prisma com comentario do autor

- Para realizar a implementação do método do prisma, será necessário a criação de um Mapper para CommentWithAuthor
```ts
import { Comment as PrismaComment, User as PrismaUser } from '@prisma/client'
import { CommentWithAuthor } from '@/domain/forum/enterprise/entities/value-objects/comment-with-author'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

type PrismaCommentWithAuthor = PrismaComment & {
  author: PrismaUser
}

export class PrismaCommentWithAuthorMapper {
  static toDomain(raw: PrismaCommentWithAuthor): CommentWithAuthor {
    return CommentWithAuthor.create({
      commentId: new UniqueEntityID(raw.id),
      authorId: new UniqueEntityID(raw.authorId),
      author: raw.author.name,
      content: raw.content,
      updatedAt: raw.updatedAt,
      createdAt: raw.createdAt,
    })
  }
}
```

### Controller comentario com Autor

- Para realizar as mudanças necessárias no nosso Controller, vamos precisar criar um novo presenter chamado de `CommentWithAuthorPresenter`

### Comentário da resposta com autor

- [X] Refatorar caso de uso `FetchAnswerComments`
- [X] Criar contrato em `AnswerCommentsRepository`
- [X] Implementar contrato em `InMemoryAnswerCommentsRepository`
- [X] Refatorar teste unitário `FetchAnswerComments`
- [X] Implementar contrato em `PrismaAnswerCommentsRepository`
  - Incluir autor na query
  - Utilizar PrismaCommentWithAuthorMapper
- [X] Refatorar Controller `FetchAnswerCommentsController`
  - Utilizar `CommentWithAuthorPresenter`
- [X] Refatorar teste unitário `FetchAnswerCommentsController`

### Value objects detalhes da pergunta (Question)

### Prisma e Controller detalhe da pergunta

### Eventos de Domínio e Cache

#### Eventos de Domínio

##### Registrando os eventos de domínio

- Como a parte da comunicação entre os domínio através de `Domain Events` é especifica da camada mais interna da aplicação, podemos criar uma pasta `events` e dentro dela vamos criar um módulo `event.module.ts`
  - Esse módulo vai utilizar `OnAnswerCreated` e `OnQuestionBestAnswerChoosen` e `SendNotificationUseCase`.
  - Para permitir que o módulo seja iniciado, é necessário definir o nosso `NotificationRepository`
  - Criar model:
    ```prisma
      model Notification {
        id          String    @id @default(uuid())
        title       String
        content     String
        readAt      DateTime? @map("read_at")
        recipientId String    @map("recipient_id")
        createdAt   DateTime  @default(now()) @map("created_at")

        recipient User @relation(fields: [recipientId], references: [id])

        @@map("notifications")
      }
    ```
  - `pnpm prisma migrate dev`
  - Criar o Mapper de Notification

##### Testes E2E de Eventos de Domínio

- https://www.eduardopires.net.br/2016/03/ddd-bounded-context/
- https://martinfowler.com/bliki/BoundedContext.html
- http://www.fabriciorissetto.com/blog/ddd-bounded-context/
- https://mehmetozkaya.medium.com/domain-events-in-ddd-and-domain-vs-integration-events-in-microservices-architecture-c8d92787de86
- https://microservices.io/patterns/data/domain-event.html
- https://microservices.io/index.html
- https://martinfowler.com/bliki/DDD_Aggregate.html
- https://medium.com/unil-ci-software-engineering/consistency-boundary-aggregate-eventual-use-case-d993aa829377
- https://www.cosmicpython.com/book/chapter_07_aggregate.html
- https://medium.com/@dangeabunea/integrating-bounded-context-for-ddd-beginners-63c21af875fb
- https://stackoverflow.com/questions/16713041/communicating-between-two-bounded-contexts-in-ddd
- https://medium.com/ssense-tech/ddd-beyond-the-basics-mastering-multi-bounded-context-integration-ca0c7cec6561
- https://www.thereformedprogrammer.net/evolving-modular-monoliths-3-passing-data-between-bounded-contexts/
- https://www.oreilly.com/library/view/learning-domain-driven-design/9781098100124/ch04.html
- https://ddd-practitioners.com/home/glossary/bounded-context/bounded-context-relationship/
- https://www.linkedin.com/pulse/managing-relationships-between-bounded-contexts-ddd-aseman-arabsorkhi-zzkbf/

#### Controllers

##### Controller: Read Notification

#### Cache

##### Criando repositório em Cache

- Cache é algo difícil em larga escala, pois quando trabalhamos com agregados, que são entidades que atuam como um agrupador de outras entidades, temos uma dependência muito forte dessas outras entidades que dependem da principal. Então, se criarmos um cache para `Pergunta` junto com sua `Resposta, Usuário e Comentários`, quando um usuário atualizar uma `Resposta`, o nosso cache não seria mais válido, sendo necessário aplicar uma invalidação de cache.
- A pergunta a se fazer na maioria das vezes é: Esse dado que estamos vendo atualmente, é algo que vai mudar constantemente?
  - Caso a resposta seja sim, provavelmente a utilização de cache não seria viável.
  - Caso a resposta seja não, provavelmente a utilização de cache é viável, uma vez que os dados que estiverem em cache serão alterados com pouca frequência.
- Fluxo da primeira requisição: Usuário (Requisição) -> Controller -> Banco de Dados -> Controller -> Mecanismo de Cache -> Controller -> Usuário (Resposta)
- Fluxo das próximas requisições: Usuário (Requisição) -> Controller -> Mecanismo de Cache -> Controller -> Usuário (Resposta).
- Qual serviço utilizar? O ideal é utilizar tecnologias que são performáticas para leitura e escrita de dados não relacionados.
- Serviços de cache conhecidos: Redis, Memcache, entre outros.
- O serviço de cache faz parte da camada de infraestrutura da aplicação, não cabe à camada de domínio sequer saber que a aplicação realiza algum tipo de salvamento das informações. 
- Normalmente o cache segue um padrão para realizar a busca de forma mais fácil
  - Os dados são armazenados em chave valor:
    - Chave: `<entity>:<identifier>:<information>`
    - Valor: Dado em si
  - Esse padrão permite que, ao trabalhar com mecanismos de cache como o `Redis`, os dados que estiverem associados após o identifier sejam deletados caso a gente delete tudo que vier antes.
- Implementação do cache:
  - Criação do arquivo `src/infra/cache/cache-repository.ts`:
  
##### Integrando Cache do Prisma

- Para criar a lógica de cache, vamos inicialmente injetar a nossa interface nos repositórios associados aos dados que vamos salvar e implementar a lógica de cache:
  ```ts
  @Injectable()
  export class PrismaQuestionsRepository implements QuestionsRepository {
    constructor(
      private readonly prisma: PrismaService,
      private readonly cache: CacheRepository,
      private readonly questionAttachmentsRepository: QuestionAttachmentsRepository,
    ) {}

    async findDetailsBySlug(slug: string): Promise<QuestionDetails | null> {
      const cacheKey = `questions:${slug}:details`
      const cacheHit = await this.cache.get(cacheKey)

      if (cacheHit) {
        const cachedData = JSON.parse(cacheHit)

        return cachedData
      }

      const question = await this.prisma.question.findUnique({
        where: { slug },
        include: {
          author: true,
          attachments: true,
        },
      })

      if (!question) return null

      const questionDetails = PrismaQuestionDetailsMapper.toDomain(question)

      this.cache.set(cacheKey, JSON.stringify(questionDetails))

      return PrismaQuestionDetailsMapper.toDomain(question)
    }

    async save(question: Question): Promise<void> {
      const prismaQuestion = PrismaQuestionMapper.toPrisma(question)

      await Promise.all([
        this.prisma.question.update({
          where: {
            id: prismaQuestion.id,
          },
          data: prismaQuestion,
        }),
        this.questionAttachmentsRepository.createMany(
          question.attachments.getNewItems(),
        ),
        this.questionAttachmentsRepository.deleteMany(
          question.attachments.getRemovedItems(),
        ),
        this.cache.delete(`question:${prismaQuestion.slug}:*`),
      ])

      DomainEvents.dispatchEventsForAggregate(question.id)
    }
  }

  ```

##### Criando Service do Redis

- Atualmente existem duas bibliotecas para redis: `ioredis` e `redis`
  - `ioredis`: Utiliza promises
  - `redis`: Utiliza callbacks
  - `npm install ioredis`
- Agora basta realizarmos a lógica da classe `RedisService`, que é responsável pela conexão com o Redis e importar o `EnvService` no módulo `CacheModule`, para que seja possível utilizar ele.

##### Implementando Cache do Redis

- Criar container do Redis para desenvolvimento
  - Utilizar as imagens da `bitnami/redis` para produção e `redis` para desenvolvimento
  ```yaml
  cache:
  container_name: nest-clean-cache
  image: redis
  ports: 
    - 6379:6379
  volumes:
    - ./data/redis:/data
  ```
- O Redis é um mecanismo de cache que possui vários tipos, sendo o mais comum a utilização dos seguintes métodos:
  - `set, get, del`: Utilizado para armazenar tipos que são compostos por `Chave e Valor`
  - `hset, hget, hdel`: Utilizado para armazenar tipos que são representados por um `HashSet`
    - Composto por `set-key` e `set`
  - `lset, lget, ldel`: Utilizado para armazenar tipos que são representados por uma `lista`
- Implementar cache com o redis
  ```ts
  import { Injectable } from '@nestjs/common'
  import { CacheRepository } from '../cache-repository'
  import { RedisService } from './redis.service'
  @Injectable()
  export class RedisCacheRepository implements CacheRepository {
    constructor(private redis: RedisService) {}

    async set(key: string, value: string): Promise<void> {
      await this.redis.set(key, value, 'EX', 60 * 15)
    }

    async get(key: string): Promise<string | null> {
      return await this.redis.get(key)
    }

    async delete(key: string): Promise<void> {
      await this.redis.del(key)
    }
  }
  ```

##### Testando persistência em cache.

- O ideal para realizar o teste do cache é fazer um teste de integração exclusivamente para o repository, uma vez que o objetivo é testar ele.
- Outro ponto importante é que **não devemos utilizar o mesmo banco de dados em memória de desenvolvimento para testes**. O ideal é aplicar uma estratégia semelhante aos testes do prisma, na onde cada um deles possuem uma instância dedicada do banco de dados.
- Para fazermos isso com o Redis, será necessário alterar para cada teste um índice aleatório do banco de dados, já que o Redis trabalha com essa arquitetura para separar diferentes banco de dados.
