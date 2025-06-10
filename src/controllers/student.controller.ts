import { pool } from "../utils/db";
import { z } from "zod/v4";
import { Context } from "elysia";
import { writeFile } from "fs/promises";
import { join, normalize } from "path";

export const studentController = {
    getStudents: async () => {
        try {
            const sql = `SELECT 
                    student_id , 
                    student_name, 
                    student_email,
                    student_main_id, 
                    student_phone, 
                    student_phone 
                FROM 
                    student`;
            const [rows]: any = await pool.query(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    getStudentById: async (ctx: any) => {
        try {
            const student_id = ctx.params.student_id;
            const sql = `SELECT * FROM student WHERE student_id = ? `;
            const [rows]: any = await pool.query(sql, [student_id]);
            return rows[0];
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
                const oldPass = oldUserData.data.student_password;
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
    //     try {
    //         // console.log("have a image for upload");
    //         const userId = ctx.user.userId;
    //         const parsedFormData = await ctx.request.formData();
    //         const publicUploadPath = join(process.cwd(), "public", "uploads");
    //         const allowedTypes = ["image/jpeg", "image/png"];
    //         const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    //         const uploaded: any = {};
    //         for (const [key, file] of parsedFormData) {
    //             if (file instanceof File) {
    //                 const { name, type, size } = file;
    //                 if (!name || !type) continue;
    //                 if (size > MAX_FILE_SIZE) {
    //                     throw `File ${name} exceeds max size of 5MB`;
    //                 }
    //                 if (!allowedTypes.includes(type)) {
    //                     throw `File type ${type} not allowed. Allowed: ${allowedTypes.join(", ")}`;
    //                 }
    //                 const arrayBuffer = await file.arrayBuffer();
    //                 const buffer = Buffer.from(arrayBuffer);
    //                 const uniqueFilename = `${Date.now()}_${name}`;
    //                 await writeFile(join(publicUploadPath, uniqueFilename), buffer);

    //                 uploaded[key] = `${process.env.API_SERVER_DOMAIN}/uploads/${uniqueFilename}`;
    //             }
    //         }
    //         const sql = `UPDATE student SET ? WHERE student_id = ?`;
    //         const [result]: any = await pool.query(sql, [uploaded, userId]);
    //         return {
    //             status: 201,
    //             success: true,
    //             message: "Images was uploaded successfully",
    //             imagesData: uploaded,
    //             result: result[0],
    //         };
    //     } catch (error) {
    //         console.error("Unexpected error: ", error);
    //         return {
    //             status: 500,
    //             success: false,
    //             message: "Unexpected error",
    //             detail: error,
    //         };
    //     }
    // },

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
};
