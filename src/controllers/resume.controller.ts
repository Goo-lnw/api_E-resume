// import { getPagination } from "../services/pagination.service";
import { pool } from "../utils/db";
import { z } from "zod/v4";
import { getSession } from "../services/user.service";
import { resumeStatusEdit } from "../services/resume.service";
export const ResumeController = {
  getTotalCount: async (): Promise<number> => {
    const [rows]: any = await pool.query(
      `SELECT COUNT(*) as count FROM resume`
    );
    return rows[0].count;
  },

  getResumeByStudentId: async (
    // ยังไม่เทส
    req: any,
    page: number,
    limit: number
  ) => {
    const offset = (page - 1) * limit;
    const sessionData = await getSession(req);
    const student_id = sessionData.userId;
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
      const sessionData = await getSession(req);
      const student_id = sessionData.userId;
      const Data = z.object({ student_id: z.number() });
      const validatedData = Data.safeParse({ student_id: student_id });
      if (!validatedData.success) {
        for (const issue of validatedData.error.issues) {
          console.error(`Validation failed: ${issue.message}`);
        }
        throw "validation fail, try again!";
      }

      const [result]: any = await pool.query(
        "INSERT INTO resume SET ?",
        validatedData.data
      );
      const resumeId = result.insertId;

      return req.status(201, {
        success: true,
        message: "Resume create successfully",
        data: resumeId,
      });
    } catch (error: any) {
      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
      });
    }
  },

  submitResumeController: async (req: any) => {
    try {
      const reqBody = req.body
      const resume_id = reqBody.resume_id;
      const student_id = reqBody.student_id;

      const reqBodySchema = z.object({
        resume_id: z.number(),
        student_id: z.number(),
      });
      const validatedReqBody = reqBodySchema.safeParse({
        resume_id: resume_id,
        student_id: student_id,
      });
      if (!validatedReqBody.success) {
        let error: any[] = [];
        for (const issue of validatedReqBody.error.issues) {
          error.push(`${issue.path} : ${issue.message}`);
          console.error(`Validation failed: ${issue.path} : ${issue.message}`);
        }
        return req.status(500, {
          success: false,
          message: "Unexpected error",
          detail: error,
        });
      }

      const result = await resumeStatusEdit(req.body, 2);

      return req.status(200, {
        success: true,
        message: "Resume submitted",
        data: result,
      });
    } catch (error) {
      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
        detail: error,
      });
    }
  },

  cancleSubmitResumeController: async (req: any) => {
    try {
      const reqBody = req.body
      const resume_id = reqBody.resume_id;
      const student_id = reqBody.student_id;

      const reqBodySchema = z.object({
        resume_id: z.number(),
        student_id: z.number(),
      });
      const validatedReqBody = reqBodySchema.safeParse({
        resume_id: resume_id,
        student_id: student_id,
      });
      if (!validatedReqBody.success) {
        let error: any[] = [];
        for (const issue of validatedReqBody.error.issues) {
          error.push(`${issue.path} : ${issue.message}`);
          console.error(`Validation failed: ${issue.path} : ${issue.message}`);
        }
        return req.status(500, {
          success: false,
          message: "Unexpected error",
          detail: error,
        });
      }

      const result = await resumeStatusEdit(req.body, 1);

      return req.status(200, {
        success: true,
        message: "cancled submit resume",
        data: result,
      });
    } catch (error) {
      console.error("Unexpected error: ", error);
      return req.status(500, {
        success: false,
        message: "Unexpected error",
        detail: error,
      });
    }
  },


};
