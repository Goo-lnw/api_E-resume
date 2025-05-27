import { Elysia } from "elysia";
import { teacherController } from "../controllers/teacher.controller";
import { teacherSchema } from "../schema/sql.schema";

export const TeacherRoutes = (app: Elysia) =>
  app
    .get("/teacher", teacherController.getTeacherController)
    .get("/teacher/:mail", teacherController.getTeacherEmail)
    .post("/teacher/create", teacherController.createTeacher, {
      body: teacherSchema,
    });
// .post("/teachers/login", TeacherLoginController);

export default TeacherRoutes;
