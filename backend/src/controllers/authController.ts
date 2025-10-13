import type { Context } from "hono"
import { generateTokenPair, getRefreshTokenPayload, regenerateAccessToken, setCookies } from "../utils/jwt"
import { findUserByEmail, addUser, getUserFromPayload } from "../utils/users"
import { getCookie } from "hono/cookie"
import { badRequest, conflict, internalServerError, unauthorized } from "../utils/replies"

export const registerHandler = async (c: Context) => {
	try {
		const body = await c.req.json()
		const email = (body?.email || "").toString().trim().toLowerCase()
		const password = (body?.password || "").toString()

		if (!email || !password) return badRequest(c, "Email and password are required")
		if (password.length < 8) return badRequest(c, "Password must be at least 8 characters")
		if (findUserByEmail(email)) return conflict(c, "User already exists")

		const passwordHash = await Bun.password.hash(password)
		const user = addUser({ email, passwordHash })
		const userId = user.id.toString()
		const {accessToken, refreshToken, fingerprint} = await generateTokenPair(userId)

		setCookies(c, fingerprint, refreshToken)
		return c.json({ accessToken })
	} catch (err: any) {
		console.error("Error occurred during registration:", err)
		return internalServerError(c)
	}
}

export const loginHandler = async (c: Context) => {
	try {
		const body = await c.req.json()
		const email = (body?.email || "").toString().trim().toLowerCase()
		const password = (body?.password || "").toString()

		if (!email || !password) return badRequest(c, "Email and password are required")
		const user = findUserByEmail(email)
		if (!user || !await Bun.password.verify(password, user.passwordHash)) return unauthorized(c)

		const userId = user.id.toString()
		const {accessToken, refreshToken, fingerprint} = await generateTokenPair(userId)
	
		setCookies(c, refreshToken, fingerprint)
		return c.json({ accessToken })
	} catch (err: any) {
		console.error("Error occurred during login:", err)
		return internalServerError(c)
	}
}

export const refreshAccessTokenHandler = async (c: Context) => {
	try {
		await refreshAccessToken(c)
		return c.json({ accessToken: c.user?.accessToken })
	} catch (err: any) {
		return unauthorized(c)
	}
}

const refreshAccessToken = async (c: Context) => {
  const refreshToken = getCookie(c, "__Secure-JWT")
  const fingerprint = getCookie(c, "__Secure-Fgp")

  try {
		if (!refreshToken || !fingerprint) throw new Error("Missing cookies")
		
    const payload = await getRefreshTokenPayload(refreshToken, fingerprint)
    const user = getUserFromPayload(payload)
    if (!user) throw new Error("User not found")

    const accessToken = await regenerateAccessToken(user.id.toString(), fingerprint)
    c.user = { id: user.id, email: user.email, accessToken }
  } catch (err: any) {
		const errorMessage = "Error refreshing access token"
		console.error(`${errorMessage}:`, err)
		throw new Error(errorMessage)
  }
}
