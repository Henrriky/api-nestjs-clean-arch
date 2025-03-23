import { config } from 'dotenv'

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'
import { DomainEvents } from '@/core/events/domain-events'
import Redis from 'ioredis'
import { envSchema } from '@/infra/env/env'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const schemaId = randomUUID()
const env = envSchema.parse(process.env)
const prisma = new PrismaClient()
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  db: env.REDIS_DB,
})

async function setupDatabaseInstanceWithPrisma(schemaId: string) {
  function generateUniqueDatabaseUrl(schemaId: string) {
    if (!env.DATABASE_URL) {
      throw new Error('Please provide a DATABASE_URL enviroment variable.')
    }

    const url = new URL(env.DATABASE_URL)

    url.searchParams.set('schema', schemaId)

    return url.toString()
  }

  const databaseURL = generateUniqueDatabaseUrl(schemaId)
  process.env.DATABASE_URL = databaseURL

  execSync('pnpm prisma migrate deploy')
}

async function setupInMemoryDatabaseInstanceWithRedis() {
  await redis.flushdb()
}

beforeAll(async () => {
  await setupDatabaseInstanceWithPrisma(schemaId)
  await setupInMemoryDatabaseInstanceWithRedis()
  DomainEvents.shouldRun = false
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
})
