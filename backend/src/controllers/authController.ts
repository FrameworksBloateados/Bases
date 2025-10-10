import type { Context } from 'hono'
import { generateJWT } from '../utils/jwt'
import { findUserByEmail, addUser } from '../utils/users'

export const registerHandler = async (c: Context) => {
	try {
		const body = await c.req.json()
		const email = (body?.email || '').toString().trim().toLowerCase()
		const password = (body?.password || '').toString()

		if (!email || !password) {
			return c.json({ error: 'Email and password are required' }, 400)
		}

		if (password.length < 8) {
			return c.json({ error: 'Password must be at least 8 characters' }, 400)
		}

		const existing = findUserByEmail(email)
		if (existing) {
			return c.json({ error: 'User already exists' }, 409)
		}

		const passwordHash = await Bun.password.hash(password)
		const user = addUser({ email, passwordHash })
		const token = await generateJWT(user.id)

		return c.json({ user: { id: user.id, email: user.email }, token }, 201)
	} catch (err: any) {
		console.error('register', err)
		return c.json({ error: 'Internal server error' }, 500)
	}
}

export const loginHandler = async (c: Context) => {
	try {
		const body = await c.req.json()
		const email = (body?.email || '').toString().trim().toLowerCase()
		const password = (body?.password || '').toString()

		if (!email || !password) {
			return c.json({ error: 'Email and password are required' }, 400)
		}

		const user = findUserByEmail(email)
		if (!user || !await Bun.password.verify(password, user.passwordHash)) {
			return c.json({ error: 'Invalid credentials' }, 401)
		}

		const token = await generateJWT(user.id)
		return c.json({ user: { id: user.id, email: user.email }, token })
	} catch (err: any) {
		console.error('login', err)
		return c.json({ error: 'Internal server error' }, 500)
	}
}
