import { error } from "zod/dist/types/v4/locales/ar";
export const authMiddleware = (app) =>
    app.derive(async ({ headers, jwt, set }) => {
        const authHeader = headers["authorization"];

        if (!authHeader) {
            set.status = 401;
            throw new Error("Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        try {
            const payload = await jwt.verify(token);
            console.log(payload);

            return {
                user: payload,
            };
        } catch {
            set.status = 401;
            throw new Error("Invalid token");
        }
    });
export const authMiddlewareStudent = (app) =>
    app.derive(async ({ headers, jwt, set, path }) => {
        const authHeader = headers["authorization"];

        if (!authHeader) {
            set.status = 401;
            throw new Error("Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        try {
            const payload = await jwt.verify(token);
            const role = payload.role;

            if (path.startsWith("/api/student") && !["student", "teacher"].includes(role)) {
                set.status = 403;
                throw ("Forbidden: Student Users only");
            }

            return {
                user: payload,
            };
        } catch (err: any) {
            if (err.startsWith("Forbidden")) {
                throw new Error(err)
            }
            set.status = 401;
            throw new Error("Invalid token");
        }
    });
export const authMiddlewareTeacher = (app) =>
    app.derive(async ({ headers, jwt, set, path }) => {
        const authHeader = headers["authorization"];

        if (!authHeader) {
            set.status = 401;
            throw new Error("Unauthorized");
        }

        const token = authHeader.split(" ")[1];

        try {
            const payload = await jwt.verify(token);
            const role = payload.role;
            // console.log(path);

            if (path.startsWith("/api/teacher") && !["teacher"].includes(role)) {
                set.status = 403;
            }

            return {
                user: payload,
            };
        } catch (err: any) {
            if (err.startsWith("Forbidden")) {
                throw new Error(err)
            }
            set.status = 401;
            throw new Error("Invalid token");
        }
    });
