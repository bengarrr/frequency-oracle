import postgres from "postgres";

// const connection = {
//     host: process.env.POSTGRES_HOST || 'localhost',
//     port: parseInt(process.env.POSTGRES_PORT || '5432')
// }

const connection = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

const sql = postgres(connection);

export default sql;