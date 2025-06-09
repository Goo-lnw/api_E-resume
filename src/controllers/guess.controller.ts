import { getUserByEmail } from "../services/user.service";
import pool from "../utils/db";

export const guessController = {
  loginController: async ({ set, body, jwt, cookie: { auth } }: any) => {
    try {
      const { email, password } = body;
      const users = await getUserByEmail(email);
      if (!users || Object.keys(users).length === 0) {
        console.log("User not found:", email);
        set.status = 401;
        return { message: "Invalid credentials" };
      }

      const isValid = await Bun.password.verify(password, users.password);
      if (!isValid) {
        set.status = 401;
        return { message: "Invalid credentials" };
      }
      console.log(users);


      const token = await jwt.sign({
        email: users.member_email,
        role: users.role,
        isAdmin: users.isAdmin,
        userId: users.id,
        resume_id: users.resume_id
      });

      auth.value = {
        authToken: token,
      };

      return {
        token,
        message: "Login successful",
        status: 200,
        data: users,
      };
    } catch (error) {
      console.error("Error in loginController:", error);
      return { error: "Internal Server Error" };
    }
  },

  registerController: async (ctx: any) => {
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
      const [rows_insert]: any = await connection.query(sql, [
        student_email,
        hashedPassword,
        student_main_id,
      ]);

      const new_student_id = rows_insert.insertId;
      const [new_resume]: any = await connection.query(
        `INSERT INTO resume (student_id) VALUES (?)`,
        [new_student_id]
      );

      const new_resume_id = new_resume.insertId;

      const insertResumePart = (query: string) =>
        connection.query(query, [new_resume_id]);

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
    } catch (err: any) {
      if (err.code === "ER_DUP_ENTRY") {
        return {
          message: "Email already exists",
          status: 409,
        };
      }
      throw err;
    }
  },

  logoutController: async ({ set, cookie: { auth } }: any) => {
    try {
      // Clear the auth cookie
      auth.remove();
      set.status = 200;
      return { message: "Logout successful" };
    } catch (error) {
      set.status = 500;
      return { error: "Logout failed" };
    }
  },
};
