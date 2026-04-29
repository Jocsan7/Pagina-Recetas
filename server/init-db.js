import fs from "fs/promises";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.resolve(__dirname, "../database/schema.sql");

async function initDatabase() {
  const sql = await fs.readFile(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  });

  try {
    await connection.query(sql);
    console.log("Base de datos creada e inicializada correctamente.");
    console.log(`Base activa: ${process.env.DB_NAME}`);
  } finally {
    await connection.end();
  }
}

try {
  await initDatabase();
  process.exit(0);
} catch (error) {
  console.error("No fue posible inicializar la base de datos desde schema.sql.");
  console.error(error.message);
  process.exit(1);
}
