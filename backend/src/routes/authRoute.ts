import { Hono } from "hono"
import { registerHandler, loginHandler } from "../controllers/authController"

export const router = new Hono()
  .post("/register", registerHandler)
  .post("/login", loginHandler)
