// Based on the OWASP recommendations for JWT usage
// https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

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
  const issuer = process.env.JWT_ISSUER || "FrameworksBloateados"
  
  return new SignJWT({
    iss: issuer,
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

    const [accessToken, refreshToken] = await Promise.all([
      createJWT("5m", access_pkcs8, {sub, fph: hashedFingerprint, ...payload}),
      createJWT("6m", refresh_pkcs8, {sub, fph: hashedFingerprint})
    ])

    return {
      accessToken, // Should be stored in memory (session storage, React Context, Redux state, etc.)
      refreshToken, // Should be stored in a cookie with HttpOnly, Secure and SameSite=Strict attributes
      fingerprint // Should be stored in a cookie with HttpOnly, Secure and SameSite=Strict attributes
    }
  } catch (err: any) {
    console.error("Error generating token pair:", err)
    return { error: "Internal server error" }
  }
}

export const regenerateAccessToken = async (sub: string, fp: string) => {
  try {
    const accessToken = await createJWT("15m", access_pkcs8, {sub, fp})
    return { accessToken }
  } catch (err: any) {
    console.error("Error regenerating access token:", err)
    return { error: "Internal server error" }
  }
}

export const verifyAccessToken = async (token: string, fingerprint: string) => {
  try {
    const { payload } = await jwtVerify(token, access_spki)
    const expectedHash = hashFingerprint(fingerprint)
    if (payload.fph !== expectedHash) {
      throw new Error("Invalid fingerprint")
    }

    return payload
  } catch (err: any) {
    console.error("Access token verification failed:", err)
    throw new Error("Invalid or expired token")
  }
}

export const verifyRefreshToken = async (token: string, fingerprint: string) => {
  try {
    const { payload } = await jwtVerify(token, refresh_spki)
    const expectedHash = hashFingerprint(fingerprint)
    if (payload.fph !== expectedHash) {
      throw new Error("Invalid fingerprint")
    }

    return payload
  } catch (err: any) {
    console.error("Refresh token verification failed:", err)
    throw new Error("Invalid or expired token")
  }
}
