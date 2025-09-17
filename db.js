import mysql from "mysql2";

const db = mysql.createPool({
  host: "localhost",
  user: "root",   // change if needed
  password: "Zidan123@2025",   // your MySQL password
  database: "eventpro"
});

export default db;
