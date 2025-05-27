import { Elysia } from "elysia";
import { UserController } from "../controllers/user.controller";
import { RegisterSchema, LoginSchema } from "../schema/sql.schema";
export const userRoutes = (app: Elysia) =>
  app
    .post("/users/register", UserController.registerController, {
      body: RegisterSchema,
    })
    .post("/users/login", UserController.loginController, {
      body: LoginSchema,
    })
    .patch("/users/edit", UserController.editUserController)
    .delete("/users/delete/:id", UserController.deleteUserController);

export default userRoutes;
