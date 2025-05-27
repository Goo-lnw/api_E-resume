import { pool } from "../utils/db";
const getUserByEmail = async (email: string) => {
  var user: any;
  user = await pool.query(
    "SELECT teacher_email as password, teacher_password, teacher_id FROM teacher WHERE teacher_email = ?",
    [email]
  );
  if (!user || Object.keys(user).length === 0) {
    user = await pool.query(
      "SELECT student_email as password, student_password, student_id FROM member WHERE student_email = ?",
      [email]
    );
  }
  return user[0];
};

export { getUserByEmail };
