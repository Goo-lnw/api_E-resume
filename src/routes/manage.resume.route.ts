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
      .put("/:resume_id/edit", ResumeController.previewResume)

      .post("/increase_skill", ResumeController.increaseSkill)
      .put("/skill/:skill_id", ResumeController.saveSkill, {
        body: addSkillSchema,
      })
      .delete("/delete_skill/:skill_id", ResumeController.deleteSkill)

      .post("/increase_soft_skill", ResumeController.increaseSoftSkill)
      .put("/soft_skill/:soft_skill_id", ResumeController.saveSoftSkill, {
        body: addSoftSkillSchema,
      })
      .delete(
        "/delete_soft_skill/:soft_skill_id",
        ResumeController.deleteSoftSkill
      )

      .post("/increase_education", ResumeController.increaseEducationHistory)
      .put(
        "/education_history/:education_history_id",
        ResumeController.saveEducationHistory,
        {
          body: addEducationHistorySchema,
        }
      )
      .delete(
        "/delete_education/:education_history_id",
        ResumeController.deleteEducationHistory
      )

      .post("/increase_project", ResumeController.increaseProject)
      .put("/project/:project_id", ResumeController.saveproject, {
        body: addProjectSchema,
      })
      .delete("/project/:project_id", ResumeController.deleteProject)

      .post("/increase_work_experience", ResumeController.increaseExperience)
      .put(
        "/work_experience/:work_experience_id",
        ResumeController.saveWorkExperience,
        {
          body: addWork_historySchema,
        }
      )
      .delete(
        "/work_experience/:work_experience_id",
        ResumeController.deleteWorkExperience
      )

      .post("/increase_internship", ResumeController.increaseInternship)
      .put("/internship/:internship_id", ResumeController.saveinternship, {
        body: addinternshipSchema,
      })
      .delete("/internship/:internship_id", ResumeController.deleteInternship)

      .post("/increase_training", ResumeController.increaseTraning)
      .put("/training/:training_id", ResumeController.saveTraning, {
        body: addTraningSchema,
      })
      .delete("/training/:training_id", ResumeController.deleteTraining)

      .post("/increase_additional_info", ResumeController.increaseAdditional)
      .put(
        "/additional_info/:additional_info_id",
        ResumeController.saveAdditionalInfo,
        {}
      )
      .delete(
        "/additional_info/:additional_info_id",
        ResumeController.deleteAdditionalInfo
      )
      .patch("/like/:resume_id", ResumeController.followResume)
  );
