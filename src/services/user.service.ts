import { pool } from "../utils/db";
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

export { getUserByEmail };
