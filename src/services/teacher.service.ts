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
    const res: any = userResult.data;

    const result = await pool.query(
      "INSERT INTO teacher ( teacher_name, teacher_email, teacher_phone, teacher_password, teacher_profile_image) VALUES (?, ?, ?, ?, ?)",
      [
        res.teacher_name,
        res.teacher_email,
        res.teacher_phone,
        res.teacher_password,
        res.teacher_profile_image,
      ]
    );
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      for (const issue of error.issues) {
        console.error("Validation failed: ", issue.message);
      }
    } else {
      console.error("Unexpected error: ", error);
    }
  }
};

export { getTeacher, getTeacherByEmail, insertTeacherService };
