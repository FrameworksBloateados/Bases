import { createMiddleware } from "hono/factory"
import { verifyAccessToken } from "../utils/jwt"
import { findUserById } from "../utils/users"
import { getCookie } from "hono/cookie"
import type { Context, Next } from "hono"

export const authenticator = createMiddleware(async (c: Context, next: Next) => {
  const url = new URL(c.req.url)
  if (url.pathname.startsWith("/auth")) return await next()

  const fingerprint = getCookie(c, "__Secure-Fgp")
  if (!fingerprint) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  const authHeader = (c.req.header && c.req.header("authorization")) || ""
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null
  if (!token) return c.json({ error: "Unauthorized" }, 401)

  try {
    const payload = await verifyAccessToken(token, fingerprint)

    const userId = Number(payload.sub)
    if (!userId || Number.isNaN(userId)) return c.json({ error: "Unauthorized" }, 401)

    const user = findUserById(userId)
    if (!user) return c.json({ error: "Unauthorized" }, 401)

    c.user = { id: user.id, email: user.email }
    return await next()
  } catch (err) {
    console.error("Authentication middleware failed:", err)
    return c.json({ error: "Unauthorized" }, 401)
  }
})
