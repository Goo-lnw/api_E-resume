import { pool } from "../utils/db";
import jwt from "@elysiajs/jwt";
const getUserByEmail = async (email: string) => {
  const [teacherRows]: any = await pool.query(
    "SELECT teacher_email as email, teacher_password as password, teacher_id as id, 'teacher' as role FROM teacher WHERE teacher_email = ?",
    [email]
  );

  if (teacherRows.length > 0) {
    return teacherRows[0];
  }

  const [studentRows]: any = await pool.query(
    "SELECT student_email as email, student_password as password, student_id as id, 'student' as role FROM student WHERE student_email = ?",
    [email]
  );

  if (studentRows.length > 0) {
    return studentRows[0];
  }

  return null;
};

const SECRET_KEY = process.env.SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in environment variables");
}

const getSession = async (cookie: Record<string, { value: string }>) => {
  const token = cookie.token?.value;
  // decode token
  // get data token user from token
  // return {user}
  return { token };
};
export { getUserByEmail, getSession };
