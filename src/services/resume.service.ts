import pool from "../utils/db";

export const resumeStatusEdit = async (reqBody: any, resume_status: number) => {
    try {
        const sql = `UPDATE resume SET resume_status = ? WHERE resume_id = ? AND student_id = ?`;
        const [result]: any = await pool.query(sql, [
            resume_status,
            reqBody.resume_id,
            reqBody.student_id,
        ]);
        console.log(result);
        if (result.affectedRows == 0) {
            throw "resume didn't found";
        }

        if (result.changedRows == 0) {
            throw "Resume status didn't change";
        }

        return result;
    } catch (error) {
        throw (error)
    }
}

export const resumeTeacherEdit = async (reqBody: any, teacher_id: number) => {
    try {
        const sql = `UPDATE resume SET teacher_id = ? WHERE resume_id = ? AND student_id = ?`;
        const [result]: any = await pool.query(sql, [
            teacher_id,
            reqBody.resume_id,
            reqBody.student_id,
        ]);
        console.log(result);
        if (result.affectedRows == 0) {
            throw "resume didn't found";
        }

        if (result.changedRows == 0) {
            throw "Resume teacher didn't change";
        }

        return result;
    } catch (error) {
        throw (error)
    }
}