// import { getPagination } from "../services/pagination.service";
import { pool } from "../utils/db";

export const ResumeController = {
  getResume: async () => {
    try {
      const sql = `SELECT
                    resume.resume_id, 
                    resume.student_id, 
                    student.student_name, 
                    student.student_email, 
                    student.student_phone, 
                    student.student_profile_image, 
                    internship.internship_company_name, 
                    internship.internship_position, 
                    internship.internship_start_date, 
                    internship.internship_id, 
                    internship.internship_end_date, 
                    internship.internship_description, 
                    internship.internship_related_files, 
                    skill.skill_id, 
                    skill.skill_name, 
                    skill.skill_type, 
                    skill.skill_proficiency, 
                    training_history.training_history_id, 
                    training_history.training_history_course_name, 
                    training_history.training_history_organization, 
                    training_history.training_history_location, 
                    training_history.training_history_date, 
                    training_history.training_history_certificate_file, 
                    work_experience.work_experience_id, 
                    work_experience.work_experience_company_name, 
                    work_experience.work_experience_position, 
                    work_experience.work_experience_start_date, 
                    work_experience.work_experience_end_date, 
                    work_experience.work_experience_description, 
                    work_experience.work_experience_highlight, 
                    notification.notification_id, 
                    notification.notification_message, 
                    notification.is_read, 
                    notification.created_at, 
                    student.student_id, 
                    additional_info.additional_info_id, 
                    additional_info.additional_info_title, 
                    additional_info.additional_info_description, 
                    additional_info.additional_info_file_attachment, 
                    education_history.education_history_id, 
                    education_history.education_history_institution, 
                    education_history.education_history_major, 
                    education_history.education_history_start_year, 
                    education_history.education_history_gpa, 
                    education_history.education_history_notes
                  FROM
                    resume
                    LEFT JOIN
                    student
                    ON 
                      resume.student_id = student.student_id
                    LEFT JOIN
                    internship
                    ON 
                      resume.resume_id = internship.resume_id
                    LEFT JOIN
                    skill
                    ON 
                      resume.resume_id = skill.resume_id
                    LEFT JOIN
                    training_history
                    ON 
                      resume.resume_id = training_history.resume_id
                    LEFT JOIN
                    work_experience
                    ON 
                      resume.resume_id = work_experience.resume_id
                    LEFT JOIN
                    notification
                    ON 
                      resume.resume_id = notification.resume_id AND
                      student.student_id = notification.student_id
                    LEFT JOIN
                    additional_info
                    ON 
                      resume.resume_id = additional_info.resume_id
                    LEFT JOIN
                    education_history
                    ON 
                      resume.resume_id = education_history.resume_id
                  `;
      const [rows]: any = await pool.query(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  getResumeById: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const sql = `SELECT
                    resume.resume_id, 
                    resume.student_id, 
                    student.student_name, 
                    student.student_email, 
                    student.student_phone, 
                    student.student_profile_image, 
                    internship.internship_company_name, 
                    internship.internship_position, 
                    internship.internship_start_date, 
                    internship.internship_id, 
                    internship.internship_end_date, 
                    internship.internship_description, 
                    internship.internship_related_files, 
                    skill.skill_id, 
                    skill.skill_name, 
                    skill.skill_type, 
                    skill.skill_proficiency, 
                    training_history.training_history_id, 
                    training_history.training_history_course_name, 
                    training_history.training_history_organization, 
                    training_history.training_history_location, 
                    training_history.training_history_date, 
                    training_history.training_history_certificate_file, 
                    work_experience.work_experience_id, 
                    work_experience.work_experience_company_name, 
                    work_experience.work_experience_position, 
                    work_experience.work_experience_start_date, 
                    work_experience.work_experience_end_date, 
                    work_experience.work_experience_description, 
                    work_experience.work_experience_highlight, 
                    notification.notification_id, 
                    notification.notification_message, 
                    notification.is_read, 
                    notification.created_at, 
                    student.student_id, 
                    additional_info.additional_info_id, 
                    additional_info.additional_info_title, 
                    additional_info.additional_info_description, 
                    additional_info.additional_info_file_attachment, 
                    education_history.education_history_id, 
                    education_history.education_history_institution, 
                    education_history.education_history_major, 
                    education_history.education_history_start_year, 
                    education_history.education_history_gpa, 
                    education_history.education_history_notes
                  FROM
                    resume
                    LEFT JOIN
                    student
                    ON 
                      resume.student_id = student.student_id
                    LEFT JOIN
                    internship
                    ON 
                      resume.resume_id = internship.resume_id
                    LEFT JOIN
                    skill
                    ON 
                      resume.resume_id = skill.resume_id
                    LEFT JOIN
                    training_history
                    ON 
                      resume.resume_id = training_history.resume_id
                    LEFT JOIN
                    work_experience
                    ON 
                      resume.resume_id = work_experience.resume_id
                    LEFT JOIN
                    notification
                    ON 
                      resume.resume_id = notification.resume_id AND
                      student.student_id = notification.student_id
                    LEFT JOIN
                    additional_info
                    ON 
                      resume.resume_id = additional_info.resume_id
                    LEFT JOIN
                    education_history
                    ON 
                      resume.resume_id = education_history.resume_id 
                    WHERE resume.resume_id = ? 
                      `;
      const [rows]: any = await pool.query(sql, [resume_id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  addSoftSkill: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const { soft_skill_name, soft_skill_description } = ctx.body;
      const sql = `UPDATE soft_skill SET soft_skill_name = ?, soft_skill_description = ? WHERE resume_id = ?`;
      const [rows]: any = await pool.query(sql, [
        soft_skill_name,
        soft_skill_description,
        resume_id,
      ]);
      return {
        message: "Education history added successfully",
        status: 200,
        insertId: rows.insertId,
      };
    } catch (error) {
      throw error;
    }
  },

  // add_additional_info: async (ctx: any) => {
  //   try {
  //     const resume_id = ctx.params.resume_id;
  //     const { skill_name } = ctx.body;
  //     const sql = `UPDATE resume SET resume_status = ? WHERE resume_id = ?`;
  //     const [rows]: any = await pool.query(sql, [resume_id, skill_name]);
  //     return rows;
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  addEducationHistory: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const {
        education_history_institution,
        education_history_major,
        education_history_start_year,
        education_history_gpa,
        education_history_notes,
      } = ctx.body;

      const sql = `
      UPDATE education_history SET
        education_history_institution = ?,
        education_history_major = ?,
        education_history_start_year = ?,
        education_history_gpa = ?,
        education_history_notes = ?
      WHERE resume_id = ?
    `;

      const [rows]: any = await pool.query(sql, [
        education_history_institution,
        education_history_major,
        education_history_start_year,
        education_history_gpa,
        education_history_notes,
        resume_id,
      ]);

      return {
        message: "Education history added successfully",
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  addWorkExperience: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const {
        work_experience_company_name,
        work_experience_position,
        work_experience_start_date,
        work_experience_end_date,
        work_experience_description,
        work_experience_highlight,
      } = ctx.body;

      const sql = `
      UPDATE work_experience SET
        work_experience_company_name = ?,
        work_experience_position = ?,
        work_experience_start_date = ?,
        work_experience_end_date = ?,
        work_experience_description = ?,
        work_experience_highlight = ?
      WHERE resume_id = ?
    `;

      const [rows]: any = await pool.query(sql, [
        work_experience_company_name,
        work_experience_position,
        work_experience_start_date,
        work_experience_end_date,
        work_experience_description,
        work_experience_highlight,
        resume_id,
      ]);

      return {
        message: "Work experience added successfully",
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  addinternship: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const {
        internship_company_name,
        internship_position,
        internship_start_date,
        internship_end_date,
        internship_description,
        internship_related_files,
      } = ctx.body;

      const sql = `
                  UPDATE internship SET
                      internship_company_name = ?,
                      internship_position = ?,
                      internship_start_date = ?,
                      internship_end_date = ?,
                      internship_description = ?,
                      internship_related_files = ?
                    WHERE resume_id = ?
                  `;

      const [rows]: any = await pool.query(sql, [
        internship_company_name,
        internship_position,
        internship_start_date,
        internship_end_date,
        internship_description,
        internship_related_files,
        resume_id,
      ]);

      return {
        message: "Internship added successfully",
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  addproject: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const {
        project_name,
        project_technology_used,
        project_description,
        project_impact,
        project_attachment_link,
      } = ctx.body;

      const sql = `
                  UPDATE project SET
                      project_name = ?,
                      project_technology_used = ?,
                      project_description = ?,
                      project_impact = ?,
                      project_attachment_link = ?
                    WHERE resume_id = ?
                  `;

      const [rows]: any = await pool.query(sql, [
        project_name,
        project_technology_used,
        project_description,
        project_impact,
        project_attachment_link,
        resume_id,
      ]);

      return {
        message: "Project added successfully",
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  addTraning: async (ctx: any) => {
    try {
      const resume_id = ctx.params.resume_id;
      const {
        training_history_course_name,
        training_history_organization,
        training_history_location,
        training_history_date,
        training_history_certificate_file,
      } = ctx.body;

      const sql = `
                  UPDATE training_history SET
                      training_history_course_name = ?,
                      training_history_organization = ?,
                      training_history_location = ?,
                      training_history_date = ?,
                      training_history_certificate_file = ?
                    WHERE resume_id = ?
                  `;

      const [rows]: any = await pool.query(sql, [
        training_history_course_name,
        training_history_organization,
        training_history_location,
        training_history_date,
        training_history_certificate_file,
        resume_id,
      ]);

      return {
        message: "Training added successfully",
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
