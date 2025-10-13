import { Hono } from "hono"
import { registerHandler, loginHandler, refreshAccessTokenHandler } from "../controllers/authController"

export const router = new Hono()
  .post("/register", registerHandler)
  .post("/login", loginHandler)
  .post("/refresh", refreshAccessTokenHandler)
  