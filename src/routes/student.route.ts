import { Elysia } from "elysia";
import { bodyCreateStudent } from "../schema/sql.schema";
import { studentController } from "../controllers/student.controller";
import { UserController } from "../controllers/user.controller";
export const studentRoutes = (app: Elysia) =>
  app.group("/student", (app) =>
    app
      .get("", studentController.getStudents)
      .get("/:student_id", studentController.getStudentById)
      .get("/with_rid", studentController.getStudentWithResumeId)
      .post("", studentController.createStudent, { body: bodyCreateStudent })
      .put("/:student_id/edit", studentController.editStudentController)
      .delete("/:student_id/delete", studentController.deleteStudentController)
      .put("/edit_profile", UserController.editProfile, {
        body: {
          multipart: {
            maxFileSize: 100 * 1024 * 1024,
          },
        },
      })
      .get("/protected", UserController.getStudentSession)
      .get("/skill", UserController.getSkill)
      .get("/soft_skill", UserController.getSoftSkill)
      .get("/education", UserController.getEducationHistory)
      .get("/project", UserController.getProject)
      .get("/work_experience", UserController.getWorkExperience)
      .get("/internship", UserController.getInternship)
      .get("/training", UserController.getTraining)
      .get("/additional_info", UserController.getAdditionalInfo)
  );
