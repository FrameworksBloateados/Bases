import { Hono } from "hono";
import { serve } from "bun";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono with Bun!"));

serve({
  fetch: app.fetch,
  port: 4000,
});
