import { Elysia } from "elysia";
import { teacherController } from "../controllers/teacher.controller";
import { teacherSchema } from "../schema/sql.schema";

export const TeacherRoutes = (app: Elysia) =>
  app
    .get("/teacher", teacherController.getTeacherController)
    .get("/teacher/:mail", teacherController.getTeacherByEmail)
    // ข้างล่างนี้ เทสแล้ว ⬇️
    .post("/teacher/create", teacherController.createTeacherController)
    .patch("/teacher/edit", teacherController.editTeacherController)
    .delete("/teacher/delete", teacherController.deleteTeacher);

export default TeacherRoutes;
