// Based on the OWASP recommendations for JWT usage
// https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

import { setCookie } from "hono/cookie"
import { randomUUID } from "node:crypto"
import { importPKCS8, importSPKI, SignJWT, jwtVerify, type JWTPayload } from "jose"

if (!process.env.ACCESS_TOKEN_PRIVATE_KEY || !process.env.ACCESS_TOKEN_PUBLIC_KEY) {
  throw new Error("Missing ACCESS_TOKEN_PRIVATE_KEY or ACCESS_TOKEN_PUBLIC_KEY environment variables")
}

if (!process.env.REFRESH_TOKEN_PRIVATE_KEY || !process.env.REFRESH_TOKEN_PUBLIC_KEY) {
  throw new Error("Missing REFRESH_TOKEN_PRIVATE_KEY or REFRESH_TOKEN_PUBLIC_KEY environment variables")
}

const access_pkcs8 = await importPKCS8(process.env.ACCESS_TOKEN_PRIVATE_KEY, "EdDSA")
const access_spki = await importSPKI(process.env.ACCESS_TOKEN_PUBLIC_KEY, "EdDSA")
const refresh_pkcs8 = await importPKCS8(process.env.REFRESH_TOKEN_PRIVATE_KEY, "EdDSA")
const refresh_spki = await importSPKI(process.env.REFRESH_TOKEN_PUBLIC_KEY, "EdDSA")

export const createJWT = (expiration: string, pkcs8: CryptoKey, payload: object) => {
  return new SignJWT({
    iss: "FrameworksBloateados",
    ...payload,
  })
    .setProtectedHeader({ typ: "JWT", alg: "EdDSA" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(pkcs8)
}

export const hashFingerprint = (fingerprint: string) => {
  return new Bun.CryptoHasher("sha256").update(fingerprint).digest("base64url")
}

export const generateTokenPair = async (sub: string, payload?: object) => {
  try {
    const fingerprint = randomUUID()
    const hashedFingerprint = hashFingerprint(fingerprint)

    const [accessToken, refreshToken] = await Promise.all([ // Using promise for concurrency
      createJWT("15m", access_pkcs8, {sub, fph: hashedFingerprint, ...payload}),
      createJWT("1y", refresh_pkcs8, {sub, fph: hashedFingerprint})
    ])

    return {
      accessToken, // Should be stored in memory (React Context, Redux state, etc.)
      refreshToken, // Should be stored in a cookie (__Secure-JWT) with HttpOnly, Secure and SameSite=Strict attributes
      fingerprint // Should be stored in a cookie (__Secure-Fgp) with HttpOnly, Secure and SameSite=Strict attributes
    }
  } catch (err: any) {
    const errorMessage = "Error generating token pair";
    console.error(`${errorMessage}:`, err)
    throw new Error(errorMessage)
  }
}

export const regenerateAccessToken = async (sub: string, fingerprint: string) => {
  try {
    return await createJWT("15m", access_pkcs8, {sub, fp: fingerprint})
  } catch (err: any) {
    const errorMessage = "Error generating access token";
    console.error(`${errorMessage}:`, err)
    throw new Error(errorMessage)
  }
}

const verifyToken = async (
  spki: CryptoKey,
  token: string,
  fingerprint: string,
) => {
  try {
    const { payload } = await jwtVerify(token, spki)
    const expectedHash = hashFingerprint(fingerprint)
    if (payload.fph !== expectedHash) throw new Error("Invalid fingerprint")
    return payload
  } catch (err: any) {
    throw err;
  }
}

export const verifyAccessToken = (token: string, fingerprint: string) =>
  verifyToken(access_spki, token, fingerprint)

export const verifyRefreshToken = (token: string, fingerprint: string) =>
  verifyToken(refresh_spki, token, fingerprint)

export const setCookies = (c: any, fingerprint: string, refreshToken: string | undefined) => {
  const atrributes = {
    httpOnly: true,
    secure: true,
    sameSite: "Strict" as const,
  }

  setCookie(c, "__Secure-Fgp", fingerprint, atrributes)
  if (refreshToken) setCookie(c, "__Secure-JWT", refreshToken, atrributes)
}
