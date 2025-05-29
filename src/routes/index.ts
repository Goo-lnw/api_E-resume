import { Elysia } from "elysia";
import userRoutes from "./user.route";
import TeacherRoutes from "./teacher.route";
import ResumeRoute from "./resume.route";
import { authMiddleware } from "../middlewares/auth.middleware";
import guessRoutes from "./guess.route";
const routes = new Elysia();

routes.group("/api", (app) =>
  app.use(guessRoutes).use(authMiddleware).use(userRoutes).use(TeacherRoutes).use(ResumeRoute)
);

export default routes;
