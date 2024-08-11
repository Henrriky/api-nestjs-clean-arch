import { expect, it, describe, beforeEach } from 'vitest'
import { RegisterStudentUseCase } from './register-student'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { InMemoryStudentsRepository } from 'test/repositories/in-memory-student-repository'
import { StudentAlreadyExistsError } from './errors/student-already-exists-error'
import { makeStudent } from 'test/factories/make-student'

let inMemoryStudentsRepository: InMemoryStudentsRepository
let fakeHashGenerator: FakeHasher
let usecase: RegisterStudentUseCase

describe('Create Question', () => {
  beforeEach(() => {
    inMemoryStudentsRepository = new InMemoryStudentsRepository()
    fakeHashGenerator = new FakeHasher()
    usecase = new RegisterStudentUseCase(
      inMemoryStudentsRepository,
      fakeHashGenerator,
    )
  })

  it('should be able to register a new student', async () => {
    const result = await usecase.execute({
      name: 'Henrriky',
      email: 'henrriky123@gmail.com',
      password: 'henrriky123',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      student: inMemoryStudentsRepository.items[0],
    })
  })

  it('should hash student password upon registration', async () => {
    const result = await usecase.execute({
      name: 'Henrriky',
      email: 'henrriky123@gmail.com',
      password: 'henrriky123',
    })

    const hashPassword = await fakeHashGenerator.hash('henrriky123')

    expect(result.isSuccess()).toBe(true)
    expect(inMemoryStudentsRepository.items[0].password).toEqual(hashPassword)
  })

  it('should not be able to register a new student when same email already exists', async () => {
    inMemoryStudentsRepository.items.push(
      makeStudent({
        name: 'Henrriky',
        email: 'henrriky123@gmail.com',
        password: await fakeHashGenerator.hash('henrriky123'),
      }),
    )

    const result = await usecase.execute({
      name: 'Henrriky',
      email: 'henrriky123@gmail.com',
      password: 'henrriky123',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(StudentAlreadyExistsError)
  })
})
