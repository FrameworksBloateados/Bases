import { Hono } from "hono";
import { serve } from "bun";

const app = new Hono();

const DATABASE_URL = process.env.DATABASE_URL;

app.get("/", (c) => c.text(`Hello, Hono with Bun! DATABASE_URL: ${DATABASE_URL}`));

serve({
  fetch: app.fetch,
  port: 3000,
});
