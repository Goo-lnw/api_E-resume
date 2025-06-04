import { Elysia } from "elysia";
import { bodyCreateStudent } from "../schema/sql.schema";
import { studentController } from "../controllers/student.controller";
export const studentRoutes = (app: Elysia) =>
  app.group("/student", (app) =>
    app
      .get("", studentController.getStudents)
      .get("/:student_id", studentController.getStudentById)
      .delete("/:student_id/delete", studentController.deleteStudentController)
      .put("/:student_id/edit", studentController.editStudentController)
      .post("", studentController.createStudent, {
        body: bodyCreateStudent,
      })
  );
