import { expect, it, describe, beforeEach } from 'vitest'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { AuthenticateStudentUseCase } from './authenticate-student'
import { Student } from '../../enterprise/entities/Student'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { makeStudent } from 'test/factories/make-student'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let fakeHashGenerator: FakeHasher
let fakeEncrypter: FakeEncrypter
let usecase: AuthenticateStudentUseCase

describe('Create Question', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    fakeHashGenerator = new FakeHasher()
    fakeEncrypter = new FakeEncrypter()
    usecase = new AuthenticateStudentUseCase(
      inMemoryStudentsRepository,
      fakeHashGenerator,
      fakeEncrypter,
    )
  })

  it('should be able to authenticate a student', async () => {
    const studentAlreadyCreated = makeStudent({
      name: 'Henrriky',
      email: 'henrriky123@gmail.com',
      password: await fakeHashGenerator.hash('henrriky123'),
    })
    inMemoryStudentsRepository.items.push(studentAlreadyCreated)

    const result = await usecase.execute({
      email: 'henrriky123@gmail.com',
      password: 'henrriky123',
    })

    const studentEncrypted = await fakeEncrypter.encrypt({
      sub: studentAlreadyCreated.id.toString(),
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      accessToken: studentEncrypted,
    })
  })

  it('should not be able authenticate a student with wrong email', async () => {
    inMemoryStudentsRepository.items.push(
      Student.create(
        makeStudent({
          name: 'Henrriky',
          email: 'henrriky123@gmail.com',
          password: await fakeHashGenerator.hash('henrriky123'),
        }),
      ),
    )

    const result = await usecase.execute({
      email: 'henrriky1234@gmail.com',
      password: 'henrriky123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able authenticate a student with wrong password', async () => {
    inMemoryStudentsRepository.items.push(
      makeStudent({
        name: 'Henrriky',
        email: 'henrriky123@gmail.com',
        password: await fakeHashGenerator.hash('henrriky123'),
      }),
    )

    const result = await usecase.execute({
      email: 'henrriky123@gmail.com',
      password: 'henrriky1234',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
