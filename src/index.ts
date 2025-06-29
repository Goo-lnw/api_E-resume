import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { cookie } from "@elysiajs/cookie";
import routes from "./routes";
import staticPlugin from "@elysiajs/static";
import { rateLimitMiddleware } from "./middlewares/ratelimiter.middleware";

const app = new Elysia()
    .use(rateLimitMiddleware)
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

            origin: process.env.CORS_ORIGIN,
            credentials: true,
        })
    )
    .use(routes)
    .get("/", () => "Hello from Elysia! running on port 8008 on VPS with CICD action bro!");

app.listen(8008);
console.log("🦊 Elysia running on http://localhost:8008");
