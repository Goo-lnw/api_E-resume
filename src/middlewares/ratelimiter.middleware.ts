import { rateLimit } from "elysia-rate-limit";

export const rateLimitMiddleware = rateLimit({
    duration: 60000,
    max: 60,

    errorResponse: new Response("too many request, please slow down :]", {
        status: 429,
        headers: new Headers({
            "Content-Type": "text/plain",
            "Custom-Header": "custom",
        }),
    }),
});
