import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import routes from "./routes";
import staticPlugin from "@elysiajs/static";
const app = new Elysia()
  .use(cookie())
  .use(
    staticPlugin({
      prefix: "/",
      assets: "./public",
    })
  )
  .use(jwt({ name: "jwt", secret: process.env.SECRET_KEY || "default_secret" }))
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    })
  )
  .use(routes);

app.listen(8008);
console.log("🦊 Elysia running on http://localhost:8008");
