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
  app

    .get("/resume", ResumeController.getResume)
    .get("/resume/:resume_id", ResumeController.getResumeById)
    .put("/resume/:resume_id/soft-skill", ResumeController.addSoftSkill, {
      body: addSkillSchema,
    })
    .put(
      "/resume/:resume_id/education-history",
      ResumeController.addEducationHistory,
      {
        body: addEducationHistorySchema,
      }
    )
    .put(
      "/resume/:resume_id/work-experience",
      ResumeController.addWorkExperience,
      {
        body: addWork_historySchema,
      }
    )
    .put("/resume/:resume_id/internship", ResumeController.addinternship, {
      body: addinternshipSchema,
    })
    .put("/resume/:resume_id/project", ResumeController.addproject, {
      body: addProjectSchema,
    })
    .put("/resume/:resume_id/training", ResumeController.addTraning, {
      body: addTraningSchema,
    });
