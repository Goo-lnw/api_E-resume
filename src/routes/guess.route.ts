import { Elysia } from "elysia";
import { guessController } from "../controllers/guess.controller";
import { RegisterSchema, LoginSchema } from "../schema/sql.schema";

export const guessRoutes = (app: Elysia) =>
  app
    .post("/register", guessController.registerController, {
      body: RegisterSchema,
    })
    .post("/login", guessController.loginController, {
      body: LoginSchema,
    });

export default guessRoutes;
