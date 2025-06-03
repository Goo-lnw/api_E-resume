import { pool } from "../utils/db";
import { z } from "zod/v4";

export const studentController = {
  getStudents: async () => {
    try {
      const sql = `SELECT student_id , student_name, student_email, student_phone, student_phone FROM student`;
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
      student_name,
      student_email,
      student_password, //no hash --
    } = ctx.body;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const sql = `INSERT INTO student (student_name, student_email, student_password) VALUES (?, ?, ?)`;
      const [rows_insert]: any = await connection.query(sql, [
        student_name,
        student_email,
        student_password,
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
        insertResumePart(
          `INSERT INTO education_history (resume_id) VALUES (?)`
        ),
        insertResumePart(`INSERT INTO work_experience (resume_id) VALUES (?)`),
        insertResumePart(`INSERT INTO project (resume_id) VALUES (?)`),
        insertResumePart(`INSERT INTO notification (resume_id) VALUES (?)`),
        insertResumePart(`INSERT INTO internship (resume_id) VALUES (?)`),
        insertResumePart(`INSERT INTO training_history (resume_id) VALUES (?)`),
        insertResumePart(`INSERT INTO soft_skill (resume_id) VALUES (?)`),
        insertResumePart(`INSERT INTO additional_info (resume_id) VALUES (?)`),
      ]);

      await connection.commit();
      return { message: "success", status: 200 };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  testStudent: async (ctx: any) => {
    console.log("access");
  },
};
