import dotenv from "dotenv";
dotenv.config();

export const config = {
    db: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
    },
    apiKey: process.env.API_KEY || "default-api-key",
};