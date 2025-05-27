import { pool } from "../utils/db";

const getTotalCount = async (tableName: string): Promise<number> => {
  const [rows]: any = await pool.query(`SELECT COUNT(*) as count FROM ??`, [
    tableName,
  ]);
  return rows[0].count;
};

const getPagination = async (
  tableName: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;
  // ใช้ ?? สำหรับ tableName เพื่อป้องกัน SQL Injection
  const [rows]: any = await pool.query(`SELECT * FROM ?? LIMIT ? OFFSET ?`, [
    tableName,
    limit,
    offset,
  ]);
  const total = await getTotalCount(tableName);

  return {
    data: rows,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};



export { getPagination };
