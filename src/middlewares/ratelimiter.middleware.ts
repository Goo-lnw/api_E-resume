import { rateLimit } from "elysia-rate-limit";

export const rateLimitMiddleware = rateLimit({
    duration: 60_000, // 1 นาที
    max: 30, // จำกัด 30 requests ต่อ IP
    errorResponse: new Response("rate-limited", {
        status: 429,
        headers: new Headers({
            "Content-Type": "text/plain",
            "Custom-Header": "custom",
        }),
    }),
});
