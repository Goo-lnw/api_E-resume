import pool from "../utils/db";


export const UserController = {

  getStudentSession: async (ctx: any) => {
    console.log();
    const auth_id = ctx.user.userId
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
                    WHERE resume.student_id = ? `;
      const [row]: any = await pool.query(sql, [auth_id])
      return row[0]
    } catch (err) {
      console.log(err);

    }
  }

};
