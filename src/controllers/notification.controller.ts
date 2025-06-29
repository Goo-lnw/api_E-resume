import { pool } from "../utils/db";

export const notificationController = {
    getNotification: async (ctx: any) => {
        try {
            let sql = `SELECT resume_id, notification_message, created_at FROM notification WHERE student_id = ? `;
            const [rows]: any = await pool.query(sql, ctx.user.userId);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },
    readNotification: async (ctx: any) => {
        try {
            let notificationDetail = await notificationController.getNotification(ctx);
            let sql = `UPDATE notification SET is_read = 0 WHERE ? `;
            const [rows]: any = await pool.query(sql, ctx.user.userId);
            return notificationDetail;
        } catch (error) {
            throw error;}
    }
};