import { Elysia } from "elysia";
import { bodyCreateStudent } from "../schema/sql.schema";
import { studentController } from "../controllers/student.controller";
export const studentRoutes = (app: Elysia) =>
  app
    .get("/student", studentController.getStudents)
    .get("/student/:student_id", studentController.getStudentById)
    .post("/student", studentController.createStudent, {
      body: bodyCreateStudent,
    });
