import pool from "../utils/db";
import { z } from "zod/v4";
import { writeFile } from "fs/promises";
import { join } from "path";

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
                    student.student_name_thai,
                    student.student_main_id,
                    student.student_email, 
                    student.student_phone, 
                    student.student_profile_image,
                    student.religion,
                    student.nationality,
                    student.date_of_birth,
                    student.ethnicity,
                    student.hobby,
                    student.weight,
                    student.height,
                    student.address,
                    student.facebook,
                    student.line,
                    student.github,
                    student.position,
                    student.graduation_gown,
                    student.suit,
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
                student_name_thai: rows[0].student_name_thai,
                student_main_id: rows[0].student_main_id,
                student_email: rows[0].student_email,
                student_phone: rows[0].student_phone,
                student_profile_image: rows[0].student_profile_image,
                graduation_gown: rows[0].graduation_gown,
                suit: rows[0].suit,
                religion: rows[0].religion,
                nationality: rows[0].nationality,
                date_of_birth: rows[0].date_of_birth,
                ethnicity: rows[0].ethnicity,
                hobby: rows[0].hobby,
                weight: rows[0].weight,
                height: rows[0].height,
                address: rows[0].address,
                facebook: rows[0].facebook,
                line: rows[0].line,
                github: rows[0].github,
                position: rows[0].position,
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

            const education = groupByUnique(["education_history_id"], rows).map((row) => ({
                education_history_institution: row.education_history_institution,
                education_history_major: row.education_history_major,
                education_history_start_year: row.education_history_start_year,
                education_history_gpa: row.education_history_gpa,
                education_history_notes: row.education_history_notes,
            }));

            const softSkills = groupByUnique(["soft_skill_id"], rows).map((row) => ({
                soft_skill_name: row.soft_skill_name,
                soft_skill_description: row.soft_skill_description,
            }));

            const training = groupByUnique(["training_history_id"], rows).map((row) => ({
                training_history_course_name: row.training_history_course_name,
                training_history_organization: row.training_history_organization,
                training_history_location: row.training_history_location,
                training_history_date: row.training_history_date,
                training_history_certificate_file: row.training_history_certificate_file,
            }));

            const workExperience = groupByUnique(["work_experience_id"], rows).map((row) => ({
                work_experience_company_name: row.work_experience_company_name,
                work_experience_position: row.work_experience_position,
                work_experience_start_date: row.work_experience_start_date,
                work_experience_end_date: row.work_experience_end_date,
                work_experience_description: row.work_experience_description,
                work_experience_highlight: row.work_experience_highlight,
            }));

            const additionalInfo = groupByUnique(["additional_info_id"], rows).map((row) => ({
                additional_info_title: row.additional_info_title,
                additional_info_description: row.additional_info_description,
                additional_info_file_attachment: row.additional_info_file_attachment,
            }));

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
    editProfile: async (ctx: any) => {
        try {
            // console.log(
            //     JSON.stringify({
            //         student_name: "Pattarasawan Sritad",
            //         student_name_thai: "ภัทรสวันต์ ศรีทัด",
            //         student_email: "680112418037@bru.ac.th",
            //         student_phone: "0816047264",
            //         student_profile_image: "http://localhost:8000/uploads/1749534318679_4042171.png",
            //         graduation_gown: "http://localhost:8000/uploads/1749534318682_4086679.png",
            //         suit: "http://localhost:8000/uploads/1749534318683_7084424.png",
            //         religion: null,
            //         nationality: null,
            //         date_of_birth: "1999-04-28 00:00:00",
            //         ethnicity: null,
            //         hobby: null,
            //         weight: null,
            //         height: null,
            //         address: null,
            //         facebook: null,
            //         line: null,
            //         github: null,
            //         position: null,
            //     })
            // );
            const userId = ctx.user.userId;
            const parsedFormData = await ctx.request.formData();

            // prepare upload image
            const publicUploadPath = join(process.cwd(), "public", "uploads");
            const allowedTypes = ["image/jpeg", "image/png"];
            const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
            const uploaded: any = {};
            let studentProfileData: any = {};
            for (const [key, data] of parsedFormData) {
                if (data instanceof File) {
                    const { name, type, size } = data;
                    if (!name || !type) continue;
                    if (size > MAX_FILE_SIZE) {
                        throw `File ${name} exceeds max size of 5MB`;
                    }
                    if (!allowedTypes.includes(type)) {
                        throw `File type ${type} not allowed. Allowed: ${allowedTypes.join(", ")}`;
                    }
                    const arrayBuffer = await data.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const uniqueFilename = `${Date.now()}_${name}`;
                    await writeFile(join(publicUploadPath, uniqueFilename), buffer);

                    uploaded[key] = `${process.env.API_SERVER_DOMAIN}/uploads/${uniqueFilename}`;
                }
                if (typeof data === "string") {
                    studentProfileData = JSON.parse(data);
                }
            }
            // merge image name to uploaded
            studentProfileData = Object.assign(studentProfileData, uploaded);

            const ProfileDataSchema = z.object({
                student_main_id: z.string().optional().nullable(),
                student_name: z.string().optional().nullable(),
                student_name_thai: z.string().optional().nullable(),
                student_email: z.string().email().optional().nullable(),
                student_phone: z.string().min(10).max(15).optional().nullable(),
                student_profile_image: z.string().optional().nullable(),
                graduation_gown: z.string().optional().nullable(),
                suit: z.string().optional().nullable(),
                religion: z.string().optional().nullable(),
                nationality: z.string().optional().nullable(),
                date_of_birth: z.string().optional().nullable(),
                ethnicity: z.string().optional().nullable(),
                hobby: z.string().optional().nullable(),
                weight: z.number().optional().nullable(),
                height: z.number().optional().nullable(),
                address: z.string().optional().nullable(),
                facebook: z.string().optional().nullable(),
                line: z.string().optional().nullable(),
                github: z.string().optional().nullable(),
                position: z.string().optional().nullable(),
                student_old_password: z.string().min(8).optional().nullable(),
                student_password: z.string().min(8).optional().nullable(),
            });
            const Validated: any = ProfileDataSchema.safeParse(studentProfileData);
            if (!Validated.success) {
                for (const issue of Validated.error.issues) {
                    console.error(`Validation failed: ${issue.path} ${issue.message}\n`);
                }
                throw "Validation failed";
            }
            studentProfileData = Validated.data;

            const sql = `UPDATE student SET ? WHERE student_id = ?`;
            const [result]: any = await pool.query(sql, [studentProfileData, userId]);
            return {
                status: 201,
                success: true,
                message: "Profile edited successfully",
                imagesData: uploaded,
                result: result[0],
            };
        } catch (error) {
            console.error("Unexpected error: ", error);
            return {
                status: 500,
                success: false,
                message: "Unexpected error",
                detail: error,
            };
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
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getSoftSkill: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT soft_skill.* FROM soft_skill 
                  JOIN resume on soft_skill.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getEducationHistory: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT education_history.* FROM education_history 
                  JOIN resume on education_history.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getProject: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT project.* FROM project 
                  JOIN resume on project.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getWorkExperience: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT work_experience.* FROM work_experience 
                  JOIN resume on work_experience.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getInternship: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT internship.* FROM internship 
                  JOIN resume on internship.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getTraining: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT training.* FROM training_history AS training
                  JOIN resume on training.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    getAdditionalInfo: async (ctx: any) => {
        const auth_id = ctx.user.userId;
        try {
            const sql = `
                  SELECT additional_info.* FROM additional_info 
                  JOIN resume on additional_info.resume_id = resume.resume_id 
                  JOIN student on student.student_id = resume.student_id 
                  WHERE student.student_id = ?
      `;
            const [rows]: any = await pool.query(sql, [auth_id]);
            return rows;
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
};
