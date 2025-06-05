import { Elysia } from "elysia";
import {
  addWork_historySchema,
  addinternshipSchema,
  addProjectSchema,
  addSkillSchema,
  addEducationHistorySchema,
  addTraningSchema,
} from "../schema/sql.schema";
import { ResumeController } from "../controllers/resume.controller";
export const manageResumeRoutes = (app: Elysia) =>
  app.group("/resume", (app) =>
    app
      .get("", ResumeController.getResume)
      .get("/:resume_id", ResumeController.getResumeById)
      .put("/:resume_id/soft-skill", ResumeController.addSoftSkill, {
        body: addSkillSchema,
      })
      .put("/:resume_id/education-history", ResumeController.addEducationHistory, {
        body: addEducationHistorySchema,
      })
      .put("/:resume_id/work-experience", ResumeController.addWorkExperience, {
        body: addWork_historySchema,
      })
      .put("/:resume_id/internship", ResumeController.addinternship, {
        body: addinternshipSchema,
      })
      .put("/:resume_id/project", ResumeController.addproject, {
        body: addProjectSchema,
      })
      .put("/:resume_id/training", ResumeController.addTraning, {
        body: addTraningSchema,
      })
      .put("/:resume_id/edit", ResumeController.editResume)
  );
