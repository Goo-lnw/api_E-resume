import { Elysia } from "elysia";
import { UserController } from "../controllers/user.controller";

export const userRoutes = (app: Elysia) =>
  app
    .get("/user", UserController.getStudentController)
    .patch("/users/edit", UserController.editUserController)
    .delete("/users/delete", UserController.deleteUserController);

export default userRoutes;
