const express = require("express");
const route = express.Router();
const multer = require("multer");
import pool from "../configs/connectDB";
const moment = require('moment');
const jwt = require("jsonwebtoken");
const controller = require("../controller/APIUser");
const checkLogin = require("../middleware/checkLogin");

route.post("/login", controller.loginUsers);
route.post("/register", controller.registerUsers);
route.get("/LayMotUser/:IDUser", checkLogin, controller.getUserInfo);
route.post("/CapNhapUser/:IDUser", checkLogin, controller.editUser);
route.post("/DoiMatKhau/:IDUser", checkLogin, controller.DoiMatKhau);

var filename = "";
const upload = multer({
  storage: multer.diskStorage({
    destination: "./src/public/images",
    filename: (req, file, cb) => {
      // tạo tên file duy nhất
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const originalName = file.originalname;
      const extension = originalName.split(".").pop();

      console.log("File Type:", file.mimetype);

      cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
      filename = file.fieldname + "-" + uniqueSuffix + "." + extension;
    },
  }),
});

route.post(
  "/ThemBaiThi/:IDUser",
  upload.single("file"),
  checkLogin,
  async (req, res) => {
    const { TenBaiThi, TgBatDau, TgKetThuc } = req.body;
    const IDUser = req.params.IDUser;

    if (!TenBaiThi || !TgBatDau || !TgKetThuc) {
      return res.status(400).json({
        success: false,
        message: "Không được bỏ trống!",
      });
    }

    if (filename === undefined || filename === "" || filename === null) {
      filename = "default.png";
    }

    try {
      const TgBatDauMySQL = convertToMySQLDate(TgBatDau);
      const TgKetThucMySQL = convertToMySQLDate(TgKetThuc);

      let [newBaiThi] = await pool.execute(
        "insert into baithi(TenBaiThi, AnhBaiThi, TgBatDau, TgKetThuc) values (?, ?, ?, ?)",
        [TenBaiThi, filename, TgBatDauMySQL, TgKetThucMySQL]
      );

      let IDBaiThi = newBaiThi.insertId;

      let [contentBaiThi] = await pool.execute(
        "insert into noidungbaithi(IDUser, IDBaiThi) values (?, ?)",
        [IDUser, IDBaiThi]
      );

      console.log(contentBaiThi)
      return res.status(200).json({
        success: true,
        message: "Thêm bài thi thành công!",
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        success: false,
        message: "Thêm bài thi thất bại!",
      });
    }
  }
);
route.get("/LayDanhSachTatCaBaiThi", controller.getAllQuiz);
route.get("/LayMotBaiThi/:IDBaiThi/:PassCode", checkLogin, controller.getOneQuiz);
route.get("/LayMotBaiThiDaThucHien/:IDBaiThi/:IDUser/:PassCode/:TgNopBai", checkLogin, controller.getOneQuizSubmited);

route.get("/LayDanhSachBaiThiDaThiCuaUser/:IDUser", checkLogin, controller.getUserQuiz);
route.get("/LayDanhSachSoLanThi/:IDUser/:PassCode", checkLogin, controller.SoLanThi);

route.post("/NopBai/:IDUser/:IDBaiThi/:PassCode", checkLogin, controller.submitQuiz);
route.get("/KetQuaThi/:IDBaiThi/:IDUser/:PassCode/:TgNopBai", checkLogin, controller.ketQuaThi);
route.get("/SearchByCode/:PassCode", checkLogin, controller.searchByCode);
route.post("/DongMoBaiThi/:IDBaiThi/:PassCode/:MoDong", checkLogin, controller.DongBaiThi);
route.post("/CopyQuiz/:IDBaiThi", checkLogin, controller.CopyQuiz);
route.get("/layDSKQMotBaiThi/:IDBaiThi/:PassCode", checkLogin, controller.layDSKQMotBaiThi);
route.post("/guiMaXacNhan", controller.guiMaXacNhan);

module.exports = route;
