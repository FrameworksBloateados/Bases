import { importPKCS8, importSPKI, SignJWT, jwtVerify, type JWTPayload } from 'jose'

if (!process.env.PRIVATE_KEY || !process.env.PUBLIC_KEY) throw new Error('Missing private or public key.')
const pkcs8 = await importPKCS8(process.env.PRIVATE_KEY, 'EdDSA')
const spki = await importSPKI(process.env.PUBLIC_KEY, 'EdDSA')

export async function generateJWT(sub: number) {
  const jwt = await new SignJWT({ sub: sub.toString() })
    .setProtectedHeader({ typ: 'JWT', alg: 'EdDSA' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(pkcs8)
  return jwt
}

export async function verifyJWT(token: string) {
  const { payload } = await jwtVerify(token, spki)
  return payload as JWTPayload
}
