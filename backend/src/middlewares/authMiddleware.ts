import { createMiddleware } from "hono/factory"
import { verifyAccessToken, verifyRefreshToken, regenerateAccessToken } from "../utils/jwt"
import { getUserFromPayload } from "../utils/users"
import { getCookie } from "hono/cookie"
import type { Context, Next } from "hono"

const unauthorized = (c: Context) => c.json({ error: "Unauthorized" }, 401)

export const authenticator = createMiddleware(async (c: Context, next: Next) => {
  const url = new URL(c.req.url)
  if (url.pathname.startsWith("/auth")) return await next()

  const fingerprint = getCookie(c, "__Secure-Fgp")
  if (!fingerprint) return unauthorized(c)

  const authHeader = c.req.header?.("authorization") || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null
  try {
    if (!token) throw new Error("No token provided")

    const payload = await verifyAccessToken(token, fingerprint)
    const user = getUserFromPayload(payload)
    if (!user) return unauthorized(c)

    c.user = { id: user.id, email: user.email, accessToken: token, fingerprint }
    return await next()
  } catch (err: any) {
    return refreshTokenAndContinue(c, next)
  }
})

const refreshTokenAndContinue = async (c: Context, next: Next) => {
  const refreshToken = getCookie(c, "__Secure-JWT")
  const fingerprint = getCookie(c, "__Secure-Fgp")
  if (!refreshToken || !fingerprint) return unauthorized(c)

  try {
    const payload = await verifyRefreshToken(refreshToken, fingerprint)
    const user = getUserFromPayload(payload)
    if (!user) return unauthorized(c)

    const accessToken = await regenerateAccessToken(user.id.toString(), fingerprint)
    c.user = { id: user.id, email: user.email, accessToken, fingerprint }
    return await next()
  } catch (err: any) {
    console.error("Error occurred during token refresh:", err)
    return c.json({ error: "Internal server error" }, 500)
  }
}
