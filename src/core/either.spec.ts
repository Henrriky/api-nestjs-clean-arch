import { Either, failure, success } from './either'

function doSomething(shouldSuccess: boolean): Either<string, number> {
  if (shouldSuccess) {
    return success(10)
  } else {
    return failure('failure')
  }
}

test('success result', () => {
  const result = doSomething(true)

  expect(result.isSuccess()).toBe(true)
  expect(result.isFailure()).toBe(false)
})

test('failure result', () => {
  const result = doSomething(false)

  expect(result.isSuccess()).toBe(false)
  expect(result.isFailure()).toBe(true)
})
