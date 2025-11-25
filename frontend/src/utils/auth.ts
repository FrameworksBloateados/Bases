import { logger } from "./logger";


export async function login({ email, password }: { email: string; password: string; }) {

  const response = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const {accessToken} = await response.json()
  logger.info(accessToken)
}

export async function register({ email, password }: { email: string; password: string; }) {

  const response = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: {
      "Content-Type": "application/json"
    }
  });
  const {accessToken} = await response.json()
  logger.info(accessToken)
}