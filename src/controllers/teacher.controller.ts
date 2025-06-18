// import { getPagination } from "../services/pagination.service";
// import { getUserByEmail } from "../services/user.service";
import { pool } from "../utils/db";
import { z } from "zod/v4";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import { randomUUIDv7 } from "bun";

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
            const hashedPassword = await Bun.password.hash(teacher_password);
            const [rows_insert]: any = await connection.query(sql, [teacher_email, hashedPassword]);

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
                const hashedPassword = await Bun.password.hash(ValidatedEntryData.teacher_password);
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
        const [result]: any = await pool.query("DELETE FROM teacher WHERE teacher_id = ?", [userId]);
        // console.log(result);

        if (result.affectedRows === 0) {
            return { status: 404, sucess: false, message: "teacher not found" };
        }
        return { status: 200, sucess: true, message: "teacher deleted successfully" };
    },

    // teacher activity controls
    getAllActivity: async (ctx: any) => {
        try {
            const sql = `SELECT * FROM activity`;
            const [rows]: any = await pool.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getActivityById: async (ctx: any) => {
        try {
            const activityId = ctx.params.activity_id;
            const sql = `SELECT * FROM activity WHERE ?`;
            const [rows]: any = await pool.query(sql, [activityId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getStudentByActivityId: async (ctx: any) => {
        try {
            const activityId = ctx.params.activity_id;
            const sql = `SELECT 
	                training_history.training_history_id,
	                student.student_name,
                    student.student_name_thai,
                    student.student_main_id,
                    activity.*
                FROM training_history
	                LEFT JOIN resume on training_history.resume_id = resume.resume_id
                    LEFT JOIN student on resume.student_id = student.student_id
                    LEFT JOIN activity on training_history.activity_id =  activity.activity_id
                WHERE training_history.activity_id = ?`;
            const [rows]: any = await pool.query(sql, [activityId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    createActivity: async (ctx: any) => {
        try {
            const ctxBody = await ctx.body;
            // console.log(ctxBody);
            const activityData: any = {};
            for (const [key, data] of Object.entries(ctxBody)) {
                if (data instanceof File) {
                    const publicUploadPath = join(process.cwd(), "public", "uploads", "activity");
                    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
                    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
                    let { name, type, size } = data;
                    if (!name || !type) {
                        throw "Check your file and try again !";
                    }
                    if (!allowedTypes.includes(type)) {
                        throw `File type ${type} not allowed. Allowed: ${allowedTypes.join(", ")}`;
                    }
                    if (size > MAX_FILE_SIZE) {
                        throw `File ${name} exceeds max size of 5MB`;
                    }
                    name = randomUUIDv7();
                    name = name.replaceAll(" ", "_");
                    switch (type) {
                        case "application/pdf":
                            name += ".pdf";
                            break;
                        case "image/png":
                            name += ".png";
                            break;
                        case "image/jpeg":
                            name += ".jpg";
                            break;
                        case "image/webp":
                            name += ".webp";
                            break;
                        default:
                            break;
                    }
                    const arrayBuffer = await data.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const uniqueFilename = `${Date.now()}_${name}`;
                    await writeFile(join(publicUploadPath, uniqueFilename), buffer);
                    activityData[key] = `${process.env.API_SERVER_DOMAIN}/uploads/activity/${uniqueFilename}`;

                    // console.log(`${key} : ${data}`);
                    // console.log(`${name} : ${type} : ${size}`);
                } else {
                    activityData[key] = data;
                }
            }

            const sql = `INSERT INTO activity SET ?`;
            const [rows_insert]: any = await pool.query(sql, [activityData]);

            return { message: "activity was created", success: true, status: 200, detail: activityData };
        } catch (err) {
            throw err;
        }
    },

    editActivity: async (ctx: any) => {
        try {
            const activityId = ctx.params.activity_id;
            const ctxBody = await ctx.body;
            const activityData: any = {};
            for (const [key, data] of Object.entries(ctxBody)) {
                if (data instanceof File) {
                    const publicUploadPath = join(process.cwd(), "public", "uploads", "activity");
                    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
                    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
                    let { name, type, size } = data;
                    if (!name || !type) {
                        throw "Check your file and try again !";
                    }
                    if (!allowedTypes.includes(type)) {
                        throw `File type ${type} not allowed. Allowed: ${allowedTypes.join(", ")}`;
                    }
                    if (size > MAX_FILE_SIZE) {
                        throw `File ${name} exceeds max size of 5MB`;
                    }
                    name = randomUUIDv7();
                    name = name.replaceAll(" ", "_");
                    switch (type) {
                        case "application/pdf":
                            name += ".pdf";
                            break;
                        case "image/png":
                            name += ".png";
                            break;
                        case "image/jpeg":
                            name += ".jpg";
                            break;
                        case "image/webp":
                            name += ".webp";
                            break;
                        default:
                            break;
                    }
                    const arrayBuffer = await data.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const uniqueFilename = `${Date.now()}_${name}`;
                    await writeFile(join(publicUploadPath, uniqueFilename), buffer);
                    activityData[key] = `${process.env.API_SERVER_DOMAIN}/uploads/activity/${uniqueFilename}`;

                    // if this id alredy have a file, delete it
                    const sqlSelect = `SELECT activity_image FROM activity WHERE activity_id = ?`;
                    const [activityDataResult]: any = await pool.query(sqlSelect, [activityId]);
                    const fileAttachment = activityDataResult[0]?.activity_image;

                    if (fileAttachment) {
                        const fileName = fileAttachment.split("activity/")[1];
                        await unlink(join(publicUploadPath, fileName));
                    } else {
                        console.log(`no old file data in server`);
                    }
                    //
                    // console.log(`${key} : ${data}`);
                    // console.log(`${name} : ${type} : ${size}`);
                } else {
                    activityData[key] = data;
                }
            }

            const sql = `UPDATE activity SET ? WHERE ?`;
            const [rows_update]: any = await pool.query(sql, [activityData, activityId]);

            return { message: "activity was edited successfully", success: true, status: 200, detail: activityData };
        } catch (err) {
            throw err;
        }
    },

    assignActivity: async (ctx: any) => {
        try {
            const activityId = ctx.body.activity_id;
            const resumeId: number[] = ctx.body.resume_id;
            const values = resumeId.map((resumeId) => [resumeId, activityId]);

            const sql = `INSERT INTO training_history (resume_id, activity_id) VALUES ?`;
            const [activityData]: any = await pool.query(sql, [values]);

            return { message: "assigned training certificate", success: true, status: 200 };
        } catch (error) {
            throw error;
        }
    },

    deleteActivity: async (ctx: any) => {
        try {
            const activityId = ctx.params.activity_id;
            const sql = `DELETE FROM activity WHERE ?`;
            await pool.query(sql, [activityId]);

            return { message: "activity was deleted sucessfully", success: true, status: 200 };
        } catch (error) {
            throw error;
        }
    },

    deleteActivityOfStudent: async (ctx: any) => {
        try {
            const activityId = ctx.params.activity_id;
            const ctxBody = ctx.body;
            const sql = `DELETE FROM 
                            training_history
                        WHERE activity_id = ? 
                        AND resume_id IN (?)`;
            const [deletedActivity]: any = await pool.query(sql, [activityId, ctxBody]);

            return { message: "activity was deleted sucessfully", success: true, status: 200 };
        } catch (error) {
            throw error;
        }
    },
};
