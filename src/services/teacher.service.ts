import { pool } from "../utils/db";
import { z } from "zod/v4";
import { getPagination } from "./pagination.service";

const getTeacher = async (page: number = 1, limit: number = 10) => {
  const res = await getPagination("teacher", page, limit);
  return res;
};

const getTeacherByEmail = async (email: string) => {
  const user = await pool.query(
    "SELECT teacher_email, teacher_password, teacher_id FROM teacher WHERE teacher_email = ?",
    [email]
  );
  return user[0];
};

const insertTeacherService = async (data: any) => {
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
      return { success: false, message: "Email already exists (duplicate)" };
    }

    console.error("Unexpected error: ", error);
    return { success: false, message: "Unexpected error", error };
  }
};

export { getTeacher, getTeacherByEmail, insertTeacherService };
