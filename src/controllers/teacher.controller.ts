import { getPagination } from "../services/pagination.service";
import { getUserByEmail } from "../services/user.service";
import { pool } from "../utils/db";
import { success, z } from "zod/v4";

export const teacherController = {
    getTeachers: async () => {
        try {
            const sql = `SELECT teacher_id , teacher_name, teacher_email,teacher_main_id, teacher_phone, teacher_phone FROM teacher`;
            const [rows]: any = await pool.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getTeacherById: async (ctx: any) => {
        try {
            const teacher_id = ctx.params.teacher_id;
            const sql = `SELECT * FROM teacher WHERE teacher_id = ? `;
            const [rows]: any = await pool.query(sql, [teacher_id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    createTeacher: async (ctx: any) => {
        const {
            teacher_email,
            teacher_password, //no hash --
            // teacher_main_id,
        } = ctx.body;
        const connection = await pool.getConnection();
        try {
            const sql = `INSERT INTO teacher (teacher_email, teacher_password) VALUES (?, ?)`;
            const hashedPassword = await Bun.password.hash(teacher_password)
            const [rows_insert]: any = await connection.query(sql, [
                teacher_email,
                hashedPassword
            ]);

            return { message: "teacher create success", success: true, status: 200 };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    editTeacherController: async (ctx: any) => {
        try {
            const userId: number = parseInt(ctx.params.teacher_id);

            const data = ctx.body;
            const userEntry = z.object({
                teacher_name: z.string().optional().nullable(),
                teacher_email: z.string().email().optional().nullable(),
                teacher_phone: z.string().min(10).max(15).optional().nullable(),
                teacher_old_password: z.string().min(8).optional().nullable(),
                teacher_password: z.string().min(8).optional().nullable(),
                teacher_profile_image: z.string().optional().nullable(),
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
                ValidatedEntryData.teacher_old_password !== undefined &&
                ValidatedEntryData.teacher_password !== undefined
            ) {
                const oldUserData = await teacherController.getTeacherById(ctx);
                const oldPass = oldUserData.data.teacher_password;
                const oldPassEntry = ctx.body.teacher_old_password;
                const passCompare = await Bun.password.verify(oldPassEntry, oldPass);
                if (!passCompare) {
                    throw "old password wrong reentry and try again";
                }
                // if contain password hash pass
                const hashedPassword = await Bun.password.hash(
                    ValidatedEntryData.teacher_password
                );
                ValidatedEntryData["teacher_password"] = hashedPassword;
                delete ValidatedEntryData.teacher_old_password;
            } else if (
                ValidatedEntryData.teacher_old_password === undefined &&
                ValidatedEntryData.teacher_password !== undefined
            ) {
                throw new Error("Please enter your old password and try again");
            } else if (
                ValidatedEntryData.teacher_old_password !== undefined &&
                ValidatedEntryData.teacher_password === undefined
            ) {
                throw new Error("please entry your new password and try again");
            } else {
            }

            const sql = `UPDATE teacher SET ? WHERE teacher_id = ?`;
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
                message: "resume edit successfully",
                status: 200,
                success: true,
                data: result,
            };

        } catch (error: any) {
            console.error("Unexpected error: ", error);
            return {
                message: "Unexpected error",
                status: 500,
                success: false,
                detail: error,
            };
        }
    },

    deleteTeacherController: async (req: any) => {
        const userId: number = parseInt(req.params.teacher_id);
        if (isNaN(userId)) {
            return { status: 400, sucess: false, message: "Invalid teacher ID" };
        }
        const [result]: any = await pool.query(
            "DELETE FROM teacher WHERE teacher_id = ?",
            [userId]
        );
        // console.log(result);

        if (result.affectedRows === 0) {
            return { status: 404, sucess: false, message: "teacher not found" };
        }
        return { status: 200, sucess: true, message: "teacher deleted successfully", };
    },
};
