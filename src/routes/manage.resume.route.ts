import { Elysia } from "elysia";
import {
  addWork_historySchema,
  addinternshipSchema,
  addProjectSchema,
  addSkillSchema,
  addEducationHistorySchema,
  addTraningSchema,
  addSoftSkillSchema,
} from "../schema/sql.schema";
import { ResumeController } from "../controllers/resume.controller";
export const manageResumeRoutes = (app: Elysia) =>
  app.group("/resume", (app) =>
    app
      .get("", ResumeController.getResume)
      .get("/:resume_id", ResumeController.getResumeById)

      .put("/skill/:skill_id", ResumeController.addSkill, {
        body: addSkillSchema,
      })
      .put("/soft_skill/:soft_skill_id", ResumeController.addSoftSkill, {
        body: addSoftSkillSchema,
      })

      .put(
        "/education-history/:education_history_id",
        ResumeController.addEducationHistory,
        {
          body: addEducationHistorySchema,
        }
      )
      .put(
        "/work-experience/:work_experience_id",
        ResumeController.addWorkExperience,
        {
          body: addWork_historySchema,
        }
      )
      .put("/internship/:internship_id", ResumeController.addinternship, {
        body: addinternshipSchema,
      })
      .put("/project/:project_id", ResumeController.addproject, {
        body: addProjectSchema,
      })
      .put("/training/:training_id", ResumeController.addTraning, {
        body: addTraningSchema,
      })
      .put("/:resume_id/edit", ResumeController.previewResume)
      .post("/:resume_id/addSkill", ResumeController.addSkill)

      .post("/education", ResumeController.increaseEducationHistory)
      .post("/increaseSoftSkill", ResumeController.increaseSoftSkill)
      .post("/increaseExperience", ResumeController.increaseExperience)
      .post("/increaseInternship", ResumeController.increaseInternship)
      .post("/increaseProject", ResumeController.increaseProject)
      .post("/increaseTraning", ResumeController.increaseTraning)
      .post("/increaseAdditional", ResumeController.increaseAdditional)
      .post("/increaseSkill", ResumeController.increaseSkill)
  );
