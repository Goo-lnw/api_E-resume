import { Elysia } from "elysia";
import { UserController } from "../controllers/user.controller";

export const userRoutes = (app: Elysia) =>
  app
    .get("/users", UserController.getUserController)
    .post("/users/register", UserController.registerController)
    .post("/users/login", UserController.loginController);

export default userRoutes;
