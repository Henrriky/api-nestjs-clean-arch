# Projeto com NestJS

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