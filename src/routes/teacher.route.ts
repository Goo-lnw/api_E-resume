import { Elysia } from "elysia";
import { activitySchema, activityAssignSchema, bodyCreateTeacher } from "../schema/sql.schema";
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

            .get("/activity", teacherController.getAllActivity)
            .get("/activity/:activity_id", teacherController.getActivityById)
            .get("/activity/:activity_id/student", teacherController.getStudentByActivityId)
            .post("/activity", teacherController.createActivity, {
                body: activitySchema,
                type: "multipart/form-data",
            })
            .post("/activity/assign_cert", teacherController.assignActivity, { body: activityAssignSchema })
            .put("/activity/:activity_id", teacherController.editActivity, {
                body: activitySchema,
                type: "multipart/form-data",
            })
            .delete("/activity/:activity_id", teacherController.deleteActivity)
            .delete("/activity/:activity_id/student", teacherController.deleteActivityOfStudent)
    );
