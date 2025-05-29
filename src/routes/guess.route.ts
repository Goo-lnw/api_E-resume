import { Elysia } from "elysia";
import { UserController } from "../controllers/user.controller";
import { RegisterSchema, LoginSchema } from "../schema/sql.schema";

export const guessRoutes = (app: Elysia) =>
    app
        .post("/register", UserController.registerController, {
            body: RegisterSchema,
        })
        .post("/login", UserController.loginController, {
            body: LoginSchema,
        })

export default guessRoutes;
