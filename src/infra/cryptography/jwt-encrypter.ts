import { Encrypter } from '@/domain/forum/application/cryptography/encrypter'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private readonly jwt: JwtService) {}

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    const accessToken = this.jwt.sign({
      ...payload,
    })

    return accessToken
  }
}
