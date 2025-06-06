// import { getPagination } from "../services/pagination.service";
import { parse } from "dotenv";
import { pool } from "../utils/db";
import { success, z } from "zod/v4"
export const ResumeController = {
  getResume: async (ctx: any) => {
  try {
    const sql = `SELECT
                  additional_info.*, 
                  education_history.*,
                  internship.*,
                  project.*,
                  resume.*, 
                  skill.*, 
                  soft_skill.*,
                  student.student_id, 
                  student.student_name,
                  student.student_main_id,
                  student.student_email, 
                  student.student_phone, 
                  student.student_profile_image,
                  training_history.*,
                  work_experience.*
                FROM
                  resume
                  LEFT JOIN student ON resume.student_id = student.student_id
                  LEFT JOIN internship ON resume.resume_id = internship.resume_id
                  LEFT JOIN skill ON resume.resume_id = skill.resume_id
                  LEFT JOIN training_history ON resume.resume_id = training_history.resume_id
                  LEFT JOIN work_experience ON resume.resume_id = work_experience.resume_id
                  LEFT JOIN notification ON resume.resume_id = notification.resume_id AND student.student_id = notification.student_id
                  LEFT JOIN additional_info ON resume.resume_id = additional_info.resume_id
                  LEFT JOIN education_history ON resume.resume_id = education_history.resume_id 
                  LEFT JOIN soft_skill ON resume.resume_id = soft_skill.resume_id
                  LEFT JOIN project ON resume.resume_id = project.resume_id 
                WHERE resume.resume_status = "draft"`;

    const [rows]: any = await pool.query(sql);

    if (!rows || rows.length === 0) return [];

    const groupBy = (arr: any[], keys: string[]) => {
      const map = new Map();
      for (const row of arr) {
        const key = keys.map(k => row[k]).join('|');
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(row);
      }
      return map;
    };

    const grouped = groupBy(rows, ["student_id", "resume_id"]);

    const results: any[] = [];

    for (const [[student_id, resume_id], groupRows] of grouped.entries()) {
      const first = groupRows[0];

      const groupByUnique = (keyFields: string[], data: any[]) => {
        const seen = new Set();
        return data.filter(item => {
          const key = keyFields.map(k => item[k]).join('|');
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      const student = {
        student_id: first.student_id,
        student_name: first.student_name,
        student_main_id: first.student_main_id,
        student_email: first.student_email,
        student_phone: first.student_phone,
        student_profile_image: first.student_profile_image,
      };

      const resume = {
        resume_id: first.resume_id,
        student_id: first.student_id,
        teacher_id: first.teacher_id,
        resume_status: first.resume_status,
        resume_teacher_comment: first.resume_teacher_comment,
        submitted_at: first.submitted_at,
        approved_at: first.approved_at,
      };

      const skills = groupByUnique(["skill_id"], groupRows).map(row => ({
        skill_name: row.skill_name,
        skill_type: row.skill_type,
        skill_proficiency: row.skill_proficiency,
      }));

      const projects = groupByUnique(["project_id"], groupRows).map(row => ({
        project_name: row.project_name,
        project_technology_used: row.project_technology_used,
        project_description: row.project_description,
        project_impact: row.project_impact,
        project_attachment_link: row.project_attachment_link,
      }));

      const internships = groupByUnique(["internship_id"], groupRows).map(row => ({
        internship_company_name: row.internship_company_name,
        internship_position: row.internship_position,
        internship_start_date: row.internship_start_date,
        internship_end_date: row.internship_end_date,
        internship_description: row.internship_description,
        internship_related_files: row.internship_related_files,
      }));

      const education = groupByUnique(["education_history_id"], groupRows).map(row => ({
        education_history_institution: row.education_history_institution,
        education_history_major: row.education_history_major,
        education_history_start_year: row.education_history_start_year,
        education_history_gpa: row.education_history_gpa,
        education_history_notes: row.education_history_notes,
      }));

      const softSkills = groupByUnique(["soft_skill_id"], groupRows).map(row => ({
        soft_skill_name: row.soft_skill_name,
        soft_skill_description: row.soft_skill_description
      }));

      const training = groupByUnique(["training_history_id"], groupRows).map(row => ({
        training_history_course_name: row.training_history_course_name,
        training_history_organization: row.training_history_organization,
        training_history_location: row.training_history_location,
        training_history_date: row.training_history_date,
        training_history_certificate_file: row.training_history_certificate_file,
      }));

      const workExperience = groupByUnique(["work_experience_id"], groupRows).map(row => ({
        work_experience_company_name: row.work_experience_company_name,
        work_experience_position: row.work_experience_position,
        work_experience_start_date: row.work_experience_start_date,
        work_experience_end_date: row.work_experience_end_date,
        work_experience_description: row.work_experience_description,
        work_experience_highlight: row.work_experience_highlight,
      }));

      const additionalInfo = groupByUnique(["additional_info_id"], groupRows).map(row => ({
        additional_info_title: row.additional_info_title,
        additional_info_description: row.additional_info_description,
        additional_info_file_attachment: row.additional_info_file_attachment,
      }));

      results.push({
        student,
        resume,
        skills,
        projects,
        internships,
        education,
        softSkills,
        training,
        workExperience,
        additionalInfo
      });
    }

    return results;
  } catch (err) {
    console.log(err);
    throw err;
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

  addSkill: async (ctx: any) => {
    try {
      const skill_id = ctx.params.skill_id;
      const { skill_name, skill_type } = ctx.body;
      const sql = `UPDATE skill SET skill_name = ?, skill_type= ? WHERE skill_id = ?`;
      const [rows]: any = await pool.query(sql, [
        skill_name,
        skill_type,
        skill_id,
      ]);
      return {
        message: "addSkill history added successfully",
        success: true,
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.log(err);
    }
  },

  addSoftSkill: async (ctx: any) => {
    try {
      const soft_skill_id = ctx.params.soft_skill_id;
      const { soft_skill_name, soft_skill_description } = ctx.body;
      console.log(soft_skill_name);
      const sql = `UPDATE soft_skill SET soft_skill_name = ?, soft_skill_description = ? WHERE soft_skill_id = ?`;
      const [rows]: any = await pool.query(sql, [
        soft_skill_name,
        soft_skill_description,
        soft_skill_id,
      ]);
      return {
        message: "addSoftSkill history added successfully",
        success: true,
        status: 200,
        insertId: rows.insertId,
      };
    } catch (error) {
      throw error;
    }
  },

  addEducationHistory: async (ctx: any) => {
    try {
      const education_history_id = ctx.params.education_history_id;
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
      WHERE education_history_id = ?
    `;

      const [rows]: any = await pool.query(sql, [
        education_history_institution,
        education_history_major,
        education_history_start_year,
        education_history_gpa,
        education_history_notes,
        education_history_id,
      ]);

      return {
        message: "Education history added successfully",
        success: true,
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
      const work_experience_id = ctx.params.work_experience_id;
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
      WHERE work_experience_id = ?
    `;

      const [rows]: any = await pool.query(sql, [
        work_experience_company_name,
        work_experience_position,
        work_experience_start_date,
        work_experience_end_date,
        work_experience_description,
        work_experience_highlight,
        work_experience_id,
      ]);

      return {
        message: "Work experience added successfully",
        success: true,
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
      const internship_id = ctx.params.internship_id;
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
                    WHERE internship_id = ?
                  `;

      const [rows]: any = await pool.query(sql, [
        internship_company_name,
        internship_position,
        internship_start_date,
        internship_end_date,
        internship_description,
        internship_related_files,
        internship_id,
      ]);

      return {
        message: "Internship added successfully",
        success: true,
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
      const project_id = ctx.params.project_id;
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
                    WHERE project_id = ?
                  `;

      const [rows]: any = await pool.query(sql, [
        project_name,
        project_technology_used,
        project_description,
        project_impact,
        project_attachment_link,
        project_id,
      ]);

      return {
        message: "Project added successfully",
        success: true,
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
      const training_id = ctx.params.training_id;
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
                    WHERE training_id = ?
                  `;

      const [rows]: any = await pool.query(sql, [
        training_history_course_name,
        training_history_organization,
        training_history_location,
        training_history_date,
        training_history_certificate_file,
        training_id,
      ]);

      return {
        message: "Training added successfully",
        success: true,
        status: 200,
        insertId: rows.insertId,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  previewResume: async (ctx: any) => {
    try {
      const ctxBody = ctx.body;
      const resume_id = parseInt(ctx.params.resume_id);
      const DataSchema = z.object({
        resume_id: z.number(),
        resume_status: z.number().optional().nullable(),
        teacher_id: z.number().optional().nullable(),
        resume_teacher_comment: z.string().optional().nullable()
      });
      const validatedData = DataSchema.safeParse({
        resume_id: resume_id,
        resume_status: ctxBody.resume_status,
        teacher_id: ctx.user.userId,
        resume_teacher_comment: ctxBody.resume_teacher_comment
      });
      if (!validatedData.success) {
        let err: any[] = [];
        for (const issue of validatedData.error.issues) {
          err.push(`${issue.path} : ${issue.message}`);
          console.error(`Validation failed: ${issue.path} : ${issue.message}`);
        }
        throw new Error("Valadition Fail", { cause: err });
      }
      // set dynamic UPDATE query SET 
      let set: { resume_status?: number; teacher_id?: number; resume_teacher_comment?: string } = {};
      if (validatedData.data.resume_status) {
        set.resume_status = validatedData.data.resume_status
      }
      if (validatedData.data.teacher_id) {
        set.teacher_id = validatedData.data.teacher_id
      }
      if (validatedData.data.resume_teacher_comment) {
        set.resume_teacher_comment = validatedData.data.resume_teacher_comment
      }
      //  update resume
      const sql = "UPDATE resume SET ? WHERE resume_id = ? ";
      const [result]: any = await pool.query(sql, [set, validatedData.data.resume_id]);
      if (result.affectedRows === 0) {
        throw ("UPDATE ERROR : Resume not found or wrong ID");
      }
      if (result.changedRows === 0) {
        throw ("UPDATE ERROR : Resume data didn't change");
      }
      //  update Notification ตาม resume status
      if (validatedData.data.resume_status && validatedData.data.resume_status === 3) {
        let notificationSet = { notification_message: "Resume ของคุณถูกอนุมัติแล้ว", is_read: 1 }
        const sql = "UPDATE notification SET ? WHERE resume_id = ?";
        const [notificationResult]: any = await pool.query(sql, [notificationSet, validatedData.data.resume_id]);
      }
      if (validatedData.data.resume_status && validatedData.data.resume_status === 4) {
        let notificationSet = { notification_message: "Resume ของคุณถูกปฎิเสธ กรุณาตรวจสอบ", is_read: 1 }
        const sql = "UPDATE notification SET ? WHERE resume_id = ?";
        const [notificationResult]: any = await pool.query(sql, [notificationSet, validatedData.data.resume_id]);
      }

      return {
        message: "resume edit successfully",
        success: true,
        status: 200
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },




  // adding 
  increaseSoftSkill: async (ctx: any) => {
    const resume_id = ctx.user.resume_id;
    try {
      const sql = "INSERT INTO soft_skill (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },

  increaseEducationHistory: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      console.log(ctx);
      const sql = "INSERT INTO education_history (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },


  increaseExperience: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      const sql = "INSERT INTO work_experience (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },


  increaseInternship: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      const sql = "INSERT INTO internship (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },

  increaseProject: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      const sql = "INSERT INTO project (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },

  increaseTraning: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      const sql = "INSERT INTO training_history (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },

  increaseAdditional: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      const sql = "INSERT INTO additional_info (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },

  increaseSkill: async (ctx: any) => {
    try {
      const resume_id = ctx.user.resume_id;
      const sql = "INSERT INTO skill (resume_id) VALUES (?)"
      await pool.query(sql, [resume_id])
      return { message: "success", status: 201 }
    } catch (err) {
      console.log(err);
    }
  },


};
