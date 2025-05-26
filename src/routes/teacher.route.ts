import { Elysia } from "elysia";
import { teacherController } from "../controllers/teacher.controller";
import { teacherSchema } from "../schema/teacher.schema";

export const TeacherRoutes = (app: Elysia) =>
  app
    .get("/teacher", teacherController.getTeacherController)
    .get("/teacher/:mail", teacherController.getTeacherEmail)
    .post("/test", teacherController.insertTeacher, { body: teacherSchema });
// .post("/teachers/login", TeacherLoginController);

export default TeacherRoutes;
