import type { Context } from "hono"
import { generateTokenPair, setCookies } from "../utils/jwt"
import { findUserByEmail, addUser } from "../utils/users"

export const registerHandler = async (c: Context) => {
	try {
		const body = await c.req.json()
		const email = (body?.email || "").toString().trim().toLowerCase()
		const password = (body?.password || "").toString()

		if (!email || !password) return c.json({ error: "Email and password are required" }, 400)
		if (password.length < 8) return c.json({ error: "Password must be at least 8 characters" }, 400)
		if (findUserByEmail(email)) return c.json({ error: "User already exists" }, 409)

		const passwordHash = await Bun.password.hash(password)
		const user = addUser({ email, passwordHash })
		const userId = user.id.toString()
		const {accessToken, refreshToken, fingerprint} = await generateTokenPair(userId)

		setCookies(c, fingerprint, refreshToken)
		return c.json({ accessToken })
	} catch (err: any) {
		console.error("Error occurred during registration:", err)
		return c.json({ error: "Internal server error" }, 500)
	}
}

export const loginHandler = async (c: Context) => {
	try {
		const body = await c.req.json()
		const email = (body?.email || "").toString().trim().toLowerCase()
		const password = (body?.password || "").toString()

		if (!email || !password) return c.json({ error: "Email and password are required" }, 400)
		const user = findUserByEmail(email)
		if (!user || !await Bun.password.verify(password, user.passwordHash)) return c.json({ error: "Invalid credentials" }, 401)

		const userId = user.id.toString()
		const {accessToken, refreshToken, fingerprint} = await generateTokenPair(userId)
	
		setCookies(c, refreshToken, fingerprint)
		return c.json({ accessToken })
	} catch (err: any) {
		console.error("Error occurred during login:", err)
		return c.json({ error: "Internal server error" }, 500)
	}
}
