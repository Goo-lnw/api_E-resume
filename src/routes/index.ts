import { Elysia } from "elysia";
import userRoutes from "./user.route";
import TeacherRoutes from "./teacher.route";
import ResumeRoute from "./resume.route";

const routes = new Elysia();

routes.group('/api', app => app
    .use(userRoutes)
    .use(TeacherRoutes)
    .use(ResumeRoute)
);

export default routes;