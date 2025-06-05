import { Elysia } from "elysia";
import { bodyCreateTeacher } from "../schema/sql.schema";
import { teacherController } from "../controllers/teacher.controller";
export const teacherRoutes = (app: Elysia) =>
  app.group("/teacher", (app) =>
    app
      .get("", teacherController.getTeachers)
      .get("/:student_id", teacherController.getTeacherById)
      .delete("/:teacher_id/delete", teacherController.deleteTeacherController)
      .put("/:teacher_id/edit", teacherController.editTeacherController)
      .post("", teacherController.createTeacher, {
        body: bodyCreateTeacher,
      })

  );
