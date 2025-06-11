import { Elysia } from "elysia";
import { bodyCreateStudent } from "../schema/sql.schema";
import { studentController } from "../controllers/student.controller";
import { UserController } from "../controllers/user.controller";
export const studentRoutes = (app: Elysia) =>
    app.group("/student", (app) =>
        app
            .get("", studentController.getStudents)
            .get("/:student_id", studentController.getStudentById)

            .post("", studentController.createStudent, { body: bodyCreateStudent })
            .put("/:student_id/edit", studentController.editStudentController)
            .delete("/:student_id/delete", studentController.deleteStudentController)

            .put("/edit_profile", studentController.editProfile)

            .get("/protected", UserController.getStudentSession)
            .get("/skill", UserController.getSkill)
            .get("/softSkill", UserController.getSoftSkill)
            .get("/education", UserController.getEducation)
    );
