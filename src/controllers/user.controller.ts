import pool from "../utils/db";

export const UserController = {
  getStudentSession: async (ctx: any) => {
    const auth_id = ctx.user.userId;
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
                    WHERE resume.student_id = ?`;

      const [rows]: any = await pool.query(sql, [auth_id]);

      if (!rows || rows.length === 0) return null;

      // Extract student & resume (singular)
      const student = {
        student_id: rows[0].student_id,
        student_name: rows[0].student_name,
        student_main_id: rows[0].student_main_id,
        student_email: rows[0].student_email,
        student_phone: rows[0].student_phone,
        student_profile_image: rows[0].student_profile_image,
      };

      const resume = {
        resume_id: rows[0].resume_id,
        student_id: rows[0].student_id,
        teacher_id: rows[0].teacher_id,
        resume_status: rows[0].resume_status,
        resume_teacher_comment: rows[0].resume_teacher_comment,
        submitted_at: rows[0].submitted_at,
        approved_at: rows[0].approved_at,
      };

      // Helper to group unique objects
      const groupByUnique = (keyFields: string[], data: any[]) => {
        const seen = new Set();
        return data.filter((item) => {
          const key = keyFields.map((k) => item[k]).join("|");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      // Grouped arrays
      const skills = groupByUnique(["skill_id"], rows).map((row) => ({
        skill_name: row.skill_name,
        skill_type: row.skill_type,
        skill_proficiency: row.skill_proficiency,
      }));

      const projects = groupByUnique(["project_id"], rows).map((row) => ({
        project_name: row.project_name,
        project_technology_used: row.project_technology_used,
        project_description: row.project_description,
        project_impact: row.project_impact,
        project_attachment_link: row.project_attachment_link,
      }));

      const internships = groupByUnique(["internship_id"], rows).map((row) => ({
        internship_company_name: row.internship_company_name,
        internship_position: row.internship_position,
        internship_start_date: row.internship_start_date,
        internship_end_date: row.internship_end_date,
        internship_description: row.internship_description,
        internship_related_files: row.internship_related_files,
      }));

      const education = groupByUnique(["education_history_id"], rows).map(
        (row) => ({
          education_history_institution: row.education_history_institution,
          education_history_major: row.education_history_major,
          education_history_start_year: row.education_history_start_year,
          education_history_gpa: row.education_history_gpa,
          education_history_notes: row.education_history_notes,
        })
      );

      const softSkills = groupByUnique(["soft_skill_id"], rows).map((row) => ({
        soft_skill_name: row.soft_skill_name,
        soft_skill_description: row.soft_skill_description,
      }));

      const training = groupByUnique(["training_history_id"], rows).map(
        (row) => ({
          training_history_course_name: row.training_history_course_name,
          training_history_organization: row.training_history_organization,
          training_history_location: row.training_history_location,
          training_history_date: row.training_history_date,
          training_history_certificate_file:
            row.training_history_certificate_file,
        })
      );

      const workExperience = groupByUnique(["work_experience_id"], rows).map(
        (row) => ({
          work_experience_company_name: row.work_experience_company_name,
          work_experience_position: row.work_experience_position,
          work_experience_start_date: row.work_experience_start_date,
          work_experience_end_date: row.work_experience_end_date,
          work_experience_description: row.work_experience_description,
          work_experience_highlight: row.work_experience_highlight,
        })
      );

      const additionalInfo = groupByUnique(["additional_info_id"], rows).map(
        (row) => ({
          additional_info_title: row.additional_info_title,
          additional_info_description: row.additional_info_description,
          additional_info_file_attachment: row.additional_info_file_attachment,
        })
      );

      return {
        student,
        resume,
        skills,
        projects,
        internships,
        education,
        softSkills,
        training,
        workExperience,
        additionalInfo,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  getSkill: async (ctx: any) => {
    const auth_id = ctx.user.userId;
    try {
      const sql = `
                  SELECT skill.* FROM skill 
                  JOIN resume on skill.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
      const [rows]: any = await pool.query(sql, [auth_id]);
      return rows;
    } catch(err) {
      console.log(err);
      throw err;
    }
  },
  deleteSkill: async (ctx: any) => {
    const skill_id = ctx.params.skill_id;
    try {
      const sql = `
                  DELETE FROM skill WHERE skill_id = ?
      `;
      const [rows]: any = await pool.query(sql, [skill_id]);
      return rows;
    } catch(err) {
      console.log(err);
      throw err;
    }
  },
};
