import { Elysia } from "elysia";
import { ResumeController } from "../controllers/resume.controller";

export const ResumeRoute = (app: Elysia) =>
    app
        .get("/resume/create", ResumeController.createResumeController)
        .put("resume/submit", ResumeController.ResumeStatusController)
// .post("/teachers/login", TeacherLoginController);

export default ResumeRoute;
