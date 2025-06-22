import { Elysia } from "elysia";
import { guessController } from "../controllers/guess.controller";
import { bodyCreateStudent, LoginSchema } from "../schema/sql.schema";

export const guessRoutes = (app: Elysia) =>
  app
    .post("/register", guessController.registerController, {
      body: bodyCreateStudent,
    })
    .post("/login", guessController.loginController, {
      body: LoginSchema,
    })
    .post("/logout", guessController.logoutController)

export default guessRoutes;
