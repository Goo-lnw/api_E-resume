import { Elysia } from "elysia";
import { bodyCreateStudent } from "../schema/sql.schema";
import { studentController } from "../controllers/student.controller";
export const studentRoutes = (app: Elysia) =>
  app.group("/student", (app) =>
    app
      .get("", studentController.getStudents)
      .get("/:student_id", studentController.getStudentById)
      .get("/test", studentController.testStudent)
      .post("", studentController.createStudent, {
        body: bodyCreateStudent,
      })
  );
