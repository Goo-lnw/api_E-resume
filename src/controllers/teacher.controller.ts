import { getPagination } from "../services/pagination.service";
import { getUserByEmail } from "../services/user.service";
import { pool } from "../utils/db";
import { z } from "zod/v4";
export const teacherController = {
  getTeacherController: async (req: any) => {
    const page: number = parseInt(req.query.page) || 1;
    const limit: number = parseInt(req.query.limit) || 10;
    const users = await getPagination("teacher", page, limit);
    if (Object.keys(users).length == 0) {
      return req.status(204, { message: "No teacher found" });
    }
    return users.data;
  },

  getTeacherEmail: async (req: any) => {
    const email: string = req.params.mail;
    const teacher: object = await getUserByEmail(email);
    if (Object.keys(teacher).length == 0) {
      return req.status(204, { message: "No teacher found" });
    }
    return req.status(200, teacher);
  },

  insertTeacher: async (req: any) => {
    try {
      const data = req.body;
      try {
        const User = z.object({
          teacher_name: z.string(),
          teacher_email: z.string().email(),
          teacher_phone: z.string().min(10).max(15),
          teacher_password: z.string().min(6),
          teacher_profile_image: z.string().optional(),
        });
        const userResult = User.safeParse(data);
        if (!userResult.success) {
          return {
            success: false,
            message: "Validation failed",
            errors: userResult.error.format(),
          };
        }

        const res = userResult.data;

        // 🔍 ตรวจสอบว่า email ซ้ำหรือไม่
        const [existing] = await pool.query(
          "SELECT teacher_id FROM teacher WHERE teacher_email = ?",
          [res.teacher_email]
        );

        if ((existing as any[]).length > 0) {
          return { success: false, message: "Email already exists" };
        }

        // ✅ หากไม่ซ้ำให้ insert
        const result = await pool.query(
          "INSERT INTO teacher (teacher_name, teacher_email, teacher_phone, teacher_password, teacher_profile_image) VALUES (?, ?, ?, ?, ?)",
          [
            res.teacher_name,
            res.teacher_email,
            res.teacher_phone,
            res.teacher_password,
            res.teacher_profile_image || null,
          ]
        );

        return {
          success: true,
          message: "Teacher inserted successfully",
          data: result,
        };
      } catch (error: any) {
        // ✨ จัดการ error ที่เกิดจาก Unique constraint
        if (error.code === "ER_DUP_ENTRY") {
          return {
            success: false,
            message: "Email already exists (duplicate)",
          };
        }

        console.error("Unexpected error: ", error);
        return { success: false, message: "Unexpected error", error };
      }
    } catch (error) {
      console.error("Error inserting teacher:", error);
      return { status: 500, message: "Internal server error" };
    }
  },
};
