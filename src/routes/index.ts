import { Elysia } from "elysia";
import { studentRoutes } from "./student.route";
import { manageResumeRoutes } from "./manage.resume.route";
import { teacherRoutes } from "./teacher.route";

// import { authMiddleware } from "../middlewares/auth.middleware";
import guessRoutes from "./guess.route";
const routes = new Elysia();

routes.group("/api", (app) =>
  app
    .use(guessRoutes)
    // .use(authMiddleware)
    .use(manageResumeRoutes)
    .use(studentRoutes)
    .use(teacherRoutes)
);

export default routes;
