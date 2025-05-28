// import { getPagination } from "../services/pagination.service";
import { getUserByEmail } from "../services/user.service";
import { pool } from "../utils/db";
import { number, z } from "zod/v4";
import { getSession } from "../services/user.service";
export const ResumeController = {
  getTotalCount: async (): Promise<number> => {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM resume`
    );
    return rows[0].count;
  },

  getResumeByStudentId: async (
    student_id: number,
    page: number,
    limit: number
  ) => {
    const offset = (page - 1) * limit;

    const [rows]: any = await pool.query(
      `SELECT * FROM resume WHERE student_id = ? LIMIT ? OFFSET ?`,
      [student_id, limit, offset]
    );

    const total = await ResumeController.getTotalCount();

    return {
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  getResumeController: async (req: any) => {
    const student_id: number = parseInt(req.query.id);
    const page: number = parseInt(req.query.page) || 1;
    const limit: number = parseInt(req.query.limit) || 10;
    const users = await ResumeController.getResumeByStudentId(
      student_id,
      page,
      limit
    );
    if (Object.keys(users).length == 0) {
      return req.status(204, { message: "No resume found" });
    }
    return users.data;
  },

  createResumeController: async (req: any) => {
    try {
      const user_id = getSession(req);
    

      // const student_id = parseInt(req.query.id);
      // const Data = z.object({ student_id: z.number() });
      // const validatedData = Data.safeParse({ student_id: student_id });
      // if (!validatedData.success) {
      //   for (const issue of validatedData.error.issues) {
      //     console.error(`Validation failed: ${issue.message}`);
      //   }
      //   throw "validation fail, try again!";
      // }

      // const [result]: any = await pool.query(
      //   "INSERT INTO resume SET ?",
      //   validatedData.data
      // );
      // const resumeId = result.insertId;

      return req.status(201, {
        success: true,
        message: "Resume create successfully",
        // data: resumeId,
      });
    } catch (error: any) {
      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
      });
    }
  },

  editResumeController: async (req: any) => {
    // ยังเทสไม่เสร็จ
    try {
      // เตรียม&ตรวจสอบ resume_id&student_id
      let reqQuery: any = req.query;
      const resume_id = parseInt(reqQuery.rid);
      const student_id = parseInt(reqQuery.sid);
      const reqQuerySchema = z.object({
        resume_id: z.number(),
        student_id: z.number(),
      });
      const validatedReqQuery = reqQuerySchema.safeParse({
        resume_id: resume_id,
        student_id: student_id,
      });
      if (!validatedReqQuery.success) {
        for (const issue of validatedReqQuery.error.issues) {
          console.error(`Validation query failed: ${issue.message}\n`);
        }
        throw "Validation failed";
      }
      // เตรียม&ตรวจสอบ request Body
      // ถ้าค่่าไหนไม่มี จะไม่ถูกอัพเดท ห้่ามส่ง stringว่าง "" มา
      let reqBody: any = req.body;
      const reqBodySchema = z.object({
        teacher_id: z.number().optional(),
        resume_status: z.number().optional(),
        resume_teacher_comment: z.string().nonempty().optional(),
      });
      const validatedReqBody = reqBodySchema.safeParse(reqBody);
      if (!validatedReqBody.success) {
        for (const issue of validatedReqBody.error.issues) {
          console.error(`Validation failed: ${issue.message}\n`);
        }
        throw "Validation failed";
      }
      // changed for easy understand kub lmao
      reqQuery = validatedReqQuery.data;
      reqBody = validatedReqBody.data;

      const sql = `UPDATE resume SET ? WHERE resume_id = ? AND student_id = ?`;
      const [result]: any = await pool.query(sql, [
        reqBody,
        reqQuery.resume_id,
        reqQuery.student_id,
      ]);

      if (result.affectedRows == 0) {
        return req.status(404, {
          success: false,
          message: "teacher id didn't found",
        });
      }

      if (result.changedRows == 0) {
        throw "No data changed";
      }

      return req.status(200, {
        success: true,
        message: "Teacher edited successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
        detail: error,
      });
    }
  },

  ResumeStatusController: async (req: any) => {
    try {
      // เตรียม&ตรวจสอบ resume_id&student_id
      let reqQuery: any = req.query;
      const resume_id = parseInt(reqQuery.rid);
      const student_id = parseInt(reqQuery.sid);
      const status_id = parseInt(reqQuery.status);
      const reqQuerySchema = z.object({
        resume_id: z.number(),
        student_id: z.number(),
      });
      const validatedReqQuery = reqQuerySchema.safeParse({
        resume_id: resume_id,
        student_id: student_id,
      });
      if (!validatedReqQuery.success) {
        for (const issue of validatedReqQuery.error.issues) {
          console.error(`Validation query failed: ${issue.message}\n`);
        }
        throw "Validation failed";
      }
      reqQuery = validatedReqQuery.data;
      const sql = `UPDATE resume SET resume_status = ? WHERE resume_id = ? AND student_id = ?`;
      const [result]: any = await pool.query(sql, [
        reqQuery.resume_id,
        reqQuery.student_id,
      ]);

      if (result.affectedRows == 0) {
        return req.status(404, {
          success: false,
          message: "teacher id didn't found",
        });
      }

      if (result.changedRows == 0) {
        throw "No data changed";
      }

      return req.status(200, {
        success: true,
        message: "submitted resume",
        data: result,
      });
    } catch (error) {}
  },
};
