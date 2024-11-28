import mysql from "mysql2/promise";

var pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  database: "TracNghiem",
});

module.exports = pool;

