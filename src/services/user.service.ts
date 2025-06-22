import { pool } from "../utils/db";

const getUserByEmail = async (email: string) => {
  const [teacherRows]: any = await pool.query(
    "SELECT teacher_name as name,  teacher_email as email, teacher_password as password, is_admin as isAdmin, teacher_id as id, 'teacher' as role FROM teacher WHERE teacher_email = ?",
    [email]
  );

  if (teacherRows.length > 0) {
    return teacherRows[0];
  }

  const [studentRows]: any = await pool.query(
    `SELECT
        student_name AS name, 
        student_email AS email, 
        student.student_id AS id, 
        'student' AS role, 
        resume.resume_id, 
        student.student_email, 
        student.student_name, 
        student.student_main_id,
        student.student_password AS password
      FROM
        student
        JOIN
        resume
        ON 
          resume.student_id = student.student_id
      WHERE
        student_email =?`,
          [email]
        );

  if (studentRows.length > 0) {
    return studentRows[0];
  }

  return null;
};

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY is not defined in environment variables");
}

const getSession = async (req: any) => {
  const cookieHeader = req.request.headers.get("cookie");
  if (!cookieHeader) return null;

  // แปลง cookie string → object
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    })
  );

  // ดึงค่า cookie ที่ชื่อว่า `auth`
  const rawAuth = cookies["auth"];
  if (!rawAuth) return null;

  try {
    // แปลงค่าที่ถูก encode มา (เช่น `%7B...%7D`)
    const decodedCookie = decodeURIComponent(rawAuth);

    // parse JSON string เช่น {"authToken":"JWT..."}
    const parsed = JSON.parse(decodedCookie);
    const token = parsed.authToken;
    if (!token) return null;

    const payload = await req.jwt.verify(token);
    // console.log("payload:", payload);
    return payload;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

export { getUserByEmail, getSession };
