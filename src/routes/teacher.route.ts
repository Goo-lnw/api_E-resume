import { Elysia } from "elysia";
import {
    activitySchema,
    activityAssignSchema,
    bodyCreateTeacher,
    deleteActivityOfStudentSchema,
} from "../schema/sql.schema";
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
            .get("/activity/student_not_in/:activity_id", teacherController.getStudentByNoActivityId)
            .get("/activity/student_in/:activity_id", teacherController.getStudentByActivityId)
            .post("/activity", teacherController.createActivity, {
                body: activitySchema,
                type: "multipart/form-data",
            })
            .post("/activity/check_in", teacherController.checkInActivity, {
                body: activityAssignSchema,
            })
            .post("/activity/assign_cert", teacherController.assignActivityCert, {
                body: activityAssignSchema,
            })
            .put("/activity/:activity_id", teacherController.editActivity, {
                body: activitySchema,
                type: "multipart/form-data",
            })
            .delete("/activity/:activity_id", teacherController.deleteActivity)
            .delete("/activity/student/:activity_id", teacherController.deleteActivityStudentCheckin, {
                body: deleteActivityOfStudentSchema,
            })
    );
