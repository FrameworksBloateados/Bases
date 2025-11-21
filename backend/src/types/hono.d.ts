import 'hono';

declare module 'hono' {
  interface Context {
    user?: {id: number; admin:boolean; email: string; balance: number; accessToken: string};
  }
}
