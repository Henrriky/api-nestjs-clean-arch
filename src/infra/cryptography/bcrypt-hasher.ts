import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'
import { compare, hash } from 'bcryptjs'

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
