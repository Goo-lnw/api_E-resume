import { pool } from "../utils/db";
import { z } from "zod/v4";
import { getPagination } from "../services/pagination.service";
export const studentController = {
    getStudents: async ({ query }: any) => {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;

        try {
            const rows: any = await getPagination("student", page, limit);
            if (!rows) {
                return {
                    message: "No students found",
                    success: false,
                    status: 404,
                };
            }
            return rows;
        } catch (error) {
            console.log("Error fetching students: ", error);
            throw error;
        }
    },

    getStudentById: async (ctx: any) => {
        try {
            const student_id = ctx.params.student_id;
            // console.log(ctx.params);

            const sql = `SELECT * FROM student WHERE student_id = ? `;
            const [rows]: any = await pool.query(sql, [student_id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    getStudentWithResumeId: async () => {
        try {
            const sql = `SELECT 
                            student.student_id,
                            resume.resume_id,
                            student.student_name, 
                            student.student_name_thai,
                            student.student_main_id, 
                            student.student_profile_image,
                            student.graduation_gown,
                            student.suit,
                            student.student_email,
                            student.student_phone
                        FROM 
                            student
                        INNER JOIN 
                            resume ON resume.student_id = student.student_id
                        
                        ORDER BY 
                            student.student_main_id;
                        `;
            const [rows]: any = await pool.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    createStudent: async (ctx: any) => {
        const {
            student_email,
            student_password, //no hash --
            student_main_id,
        } = ctx.body;
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            const hashedPassword = await Bun.password.hash(student_password);
            const sql = `INSERT INTO student (student_email, student_password , student_main_id) VALUES (?, ?, ?)`;
            const [rows_insert]: any = await connection.query(sql, [student_email, hashedPassword, student_main_id]);

            const new_student_id = rows_insert.insertId;
            const [new_resume]: any = await connection.query(`INSERT INTO resume (student_id) VALUES (?)`, [
                new_student_id,
            ]);

            const new_resume_id = new_resume.insertId;

            const insertResumePart = (query: string) => connection.query(query, [new_resume_id]);

            await Promise.all([
                insertResumePart(`INSERT INTO skill (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO education_history (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO work_experience (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO project (resume_id) VALUES (?)`),
                // insertResumePart(`INSERT INTO notification (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO internship (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO training_history (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO soft_skill (resume_id) VALUES (?)`),
                insertResumePart(`INSERT INTO additional_info (resume_id) VALUES (?)`),
            ]);
            const [new_notification]: any = await connection.query(
                `INSERT INTO notification (resume_id,student_id) VALUES (?,?)`,
                [new_resume_id, new_student_id]
            );
            await connection.commit();
            return {
                message: "student created successfully",
                success: true,
                status: 200,
            };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    editStudentController: async (ctx: any) => {
        try {
            const userId: number = parseInt(ctx.params.student_id);
            const data = ctx.body;
            // console.log(ctx.body);

            const userEntry = z.object({
                student_main_id: z.string().optional().nullable(),
                student_name: z.string().optional().nullable(),
                student_email: z.string().email().optional().nullable(),
                student_phone: z.string().min(10).max(15).optional().nullable(),
                student_old_password: z.string().min(8).optional().nullable(),
                student_password: z.string().min(8).optional().nullable(),
                student_profile_image: z.string().optional().nullable(),
            });

            const ValidatedEntry: any = userEntry.safeParse(data);

            if (!ValidatedEntry.success) {
                for (const issue of ValidatedEntry.error.issues) {
                    console.error(`Validation failed: ${issue.path} ${issue.message}\n`);
                }
                throw "Validation failed";
            }

            const ValidatedEntryData: any = ValidatedEntry.data;

            if (
                ValidatedEntryData.student_old_password !== undefined &&
                ValidatedEntryData.student_password !== undefined
            ) {
                const oldUserData = await studentController.getStudentById(ctx);
                const oldPass = oldUserData.student_password;
                const oldPassEntry = ctx.body.student_old_password;
                const passCompare = await Bun.password.verify(oldPassEntry, oldPass);
                if (!passCompare) {
                    throw "old password wrong reentry and try again";
                }
                // if contain password hash pass
                const hashedPassword = await Bun.password.hash(ValidatedEntryData.student_password);
                ValidatedEntryData["student_password"] = hashedPassword;
                delete ValidatedEntryData.student_old_password;
            } else if (
                ValidatedEntryData.student_old_password === undefined &&
                ValidatedEntryData.student_password !== undefined
            ) {
                throw new Error("Please enter your old password and try again");
            } else if (
                ValidatedEntryData.student_old_password !== undefined &&
                ValidatedEntryData.student_password === undefined
            ) {
                throw new Error("please entry your new password and try again");
            } else {
            }

            const sql = `UPDATE student SET ? WHERE student_id = ?`;
            const [result]: any = await pool.query(sql, [ValidatedEntryData, userId]);

            if (result.affectedRows == 0) {
                return {
                    status: 404,
                    success: false,
                    message: "user id didn't found",
                };
            }

            if (result.changedRows == 0) {
                throw "No data changed";
            }

            return {
                status: 200,
                success: true,
                message: "User edited successfully",
                data: result,
            };
        } catch (error: any) {
            console.error("Unexpected error: ", error);
            return {
                status: 500,
                success: false,
                message: "Unexpected error",
                detail: error,
            };
        }
    },

    deleteStudentController: async (ctx: any) => {
        const student_id: number = parseInt(ctx.params.student_id);
        if (isNaN(student_id)) {
            return {
                status: 400,
                sucess: false,
                message: "Invalid student ID",
            };
        }
        const [result]: any = await pool.query("DELETE FROM student WHERE student_id = ?", [student_id]);

        if (result.affectedRows === 0) {
            return {
                message: "student not found",
                success: false,
                status: 404,
            };
        }
        return {
            message: "student deleted successfully",
            success: true,
            status: 200,
        };
    },
};
