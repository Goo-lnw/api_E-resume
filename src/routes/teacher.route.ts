import { Elysia } from "elysia";
import { teacherController } from "../controllers/teacher.controller";
import { teacherSchema, UpdateTeacherSchema } from "../schema/sql.schema";

export const TeacherRoutes = (app: Elysia) =>
  app
    .get("/teacher", teacherController.getTeacherController)
    .get("/teacher/:mail", teacherController.getTeacherEmail)
    .post("/teacher/create", teacherController.createTeacher, {
      body: teacherSchema,
    }).patch("/teacher/edit", teacherController.editTeacher);
// .post("/teachers/login", TeacherLoginController);

export default TeacherRoutes;
