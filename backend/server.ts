import { Hono } from "hono"
import { logger } from "hono/logger"
import { serve } from "bun"
import { router as auth } from "./src/routes/authRoute"
import { authenticator } from "./src/middlewares/authMiddleware"

const port = Number(process.env.PORT) || 3000
const app = new Hono()
  .use(logger())
  .use(authenticator)
  .route("/auth", auth)
  .route("/", new Hono().get("/", (c) => c.text(`Hi ${c.user!.email}, your ID is ${c.user!.id}.`)))

serve({
  fetch: app.fetch,
  port
})

console.log(`Server running at http://localhost:${port}`)
