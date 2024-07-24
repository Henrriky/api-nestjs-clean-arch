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