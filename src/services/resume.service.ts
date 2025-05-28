import { z } from "zod/v4";

export const editResume = async (pool: any, resume_id: number, student_id?: number, teacher_id?: number, data?: any) => {
    try {
        // เตรียม & ตรวจสอบ resume_id & student_id
        const sql = `UPDATE resume SET ? WHERE ? AND ?`;
        const [result]: any = await pool.query(sql, [data, resume_id, student_id]);

        if (result.affectedRows == 0) {
            return req.status(404, {
                success: false,
                message: "teacher id didn't found"
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
            detail: error
        });
    }
}

