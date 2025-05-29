import { Elysia } from "elysia";
import userRoutes from "./user.route";
import TeacherRoutes from "./teacher.route";
import ResumeRoute from "./resume.route";
// import { authMiddleware } from "../middlewares/auth.middleware";
const routes = new Elysia();

routes.group("/api", (app) =>
  app
    .use(userRoutes)
    // .use(authMiddleware)
    .use(TeacherRoutes)
    .use(ResumeRoute)
);

export default routes;
