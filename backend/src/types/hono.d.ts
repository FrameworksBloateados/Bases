import "hono"

declare module "hono" {
  interface Context {
    user?: { id: number; email: string; accessToken: string, fingerprint: string}
  }
}
