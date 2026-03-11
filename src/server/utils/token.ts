import { randomUUID } from "crypto"
import { sign, verify } from "hono/jwt"
import { JWTPayload } from "hono/utils/jwt/types"

export interface Provider {
  generateTokenPair(
    userID: string,
    email: string,
    role: string
  ): Promise<TokenPair>

  parseToken(token: string): Promise<JwtClaims>
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
  atExpires: number
  rtExpires: number
  accessUUID: string
  refreshUUID: string
}

export interface Claims {
  userID: string
  email: string
  role: string
  tokenID: string
}

export interface JwtClaims extends JWTPayload  {
  user_id: string
  email: string
  role: string
  token_id: string
  iss: string
  exp: number
}

export class JwtProvider implements Provider {
  constructor(private secret: string) {}

  static newJWTProvider(secret: string): JwtProvider {
    return new JwtProvider(secret)
  }

  async generateTokenPair(
    userID: string,
    email: string,
    role: string
  ): Promise<TokenPair> {
    const now = Math.floor(Date.now() / 1000)

    const td: TokenPair = {
      accessToken: "",
      refreshToken: "",
      atExpires: now + 15 * 60,
      rtExpires: now + 7 * 24 * 60 * 60,
      accessUUID: randomUUID(),
      refreshUUID: randomUUID(),
    }

    // ACCESS TOKEN
    const accessPayload: JWTPayload = {
      user_id: userID,
      email,
      role,
      token_id: td.accessUUID,
      iss: "stream.api",
      exp: td.atExpires,
    }

    td.accessToken = await sign(accessPayload, this.secret)

    // REFRESH TOKEN
    const refreshPayload = {
      refresh_uuid: td.refreshUUID,
      user_id: userID,
      exp: td.rtExpires,
    }

    td.refreshToken = await sign(refreshPayload, this.secret)

    return td
  }

  async parseToken(token: string): Promise<JwtClaims> {
    const payload = await verify(token, this.secret, "HS256") as JwtClaims

    if (!payload) {
      throw new Error("invalid token")
    }
    return payload
  }
}