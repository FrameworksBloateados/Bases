import 'hono';

declare module 'hono' {
  interface Context {
    user: {
      id: number;
      admin: boolean;
      username: string;
      email: string;
      balance: number;
      created_at: string;
      updated_at: string;
      accessToken: string;
    };
  }
}
