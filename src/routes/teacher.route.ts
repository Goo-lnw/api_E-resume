import { Elysia } from "elysia";
import { teacherController } from "../controllers/teacher.controller";
import { teacherSchema } from "../schema/sql.schema";

export const TeacherRoutes = (app: Elysia) =>
  app
    .get("/teacher", teacherController.getTeacherController)
    .get("/teacher/:mail", teacherController.getTeacherByEmail)
    .post("/teacher/create", teacherController.createTeacherController, {
      body: teacherSchema,
    })
    .patch("/teacher/edit/:id", teacherController.editTeacherController)
    .delete("/teacher/delete/:id", teacherController.deleteTeacher);

export default TeacherRoutes;
