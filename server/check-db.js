import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

try {
  const [rows] = await pool.query("SELECT 1 AS ok");
  console.log("Conexion MySQL correcta.", rows[0]);
  process.exit(0);
} catch (error) {
  console.error("No fue posible conectar con MySQL.");
  console.error(error.message);
  process.exit(1);
} finally {
  await pool.end();
}
