import { Elysia } from "elysia";
import { bodyCreateStudent } from "../schema/sql.schema";
import { teacherController } from "../controllers/teacher.controller";
export const teacherRoutes = (app: Elysia) =>
  app.group("/teacher", (app) =>
    app.get("", teacherController.testTeacherController)
  );
