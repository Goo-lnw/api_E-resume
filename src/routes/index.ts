import { Elysia } from "elysia";
import userRoutes from "./user.route";
import TeacherRoutes from "./teacher.route";

const routes = new Elysia();

routes.group('/api', app => app
    .use(userRoutes)
    .use(TeacherRoutes)
);

export default routes;