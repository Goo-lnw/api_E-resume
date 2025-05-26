import { Elysia } from "elysia";
import {
  getUserController,
  loginController,
} from "../controllers/user.controller";

export const userRoutes = (app: Elysia) =>
  app.get("/users", getUserController).post("/users/login", loginController);

export default userRoutes;
