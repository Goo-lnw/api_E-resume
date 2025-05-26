import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import { routes } from "./routes";

const app = new Elysia()
  .use(cookie())
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET || "secret" }))
  .use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  )
  .use(routes);

app.listen(8000);
console.log("🦊 Elysia running on http://localhost:8000");
