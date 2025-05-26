import { Elysia } from "elysia";
import userRoutes from "./user.route";
const routes = new Elysia();

routes.group('/api', app => app
    .use(userRoutes)
);

export default routes;