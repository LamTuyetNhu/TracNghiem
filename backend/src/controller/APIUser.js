import pool from "../configs/connectDB";
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

function convertToMySQLDate(dateString) {
  const [day, month, year] = dateString.split("/");
  return moment(`${year}-${month}-${day}`, "YYYY-MM-DD").toISOString();
}

const convertUTCToLocalTime = (utcDateString) => {
  const date = new Date(utcDateString);
  // Lấy múi giờ địa phương (ví dụ +7 giờ)
  const localOffset = 7 * 60 * 60 * 1000; // Adjust based on your timezone
  const localDate = new Date(date.getTime() + localOffset);

  // Format lại về định dạng giống trong database (yyyy-MM-dd HH:mm:ss)
  const formattedDate = localDate.toISOString().slice(0, 19).replace("T", " ");
  return formattedDate;
};

const loginUsers = async (req, res) => {
  const { email, password } = req.body;
  // setTimeout(async () => {
  console.log(req.body);

  if (!email || !password) {
    return res.status(500).json({
      success: false,
      message: "Không được bỏ trống!",
    });
  }

  let [verifyEmail] = await pool.execute(
    "SELECT * FROM users where emailUser = ? and TTUser = 1",
    [email]
  );

  console.log(verifyEmail);

  if (verifyEmail.length === 0) {
    return res.status(500).json({
      success: false,
      message: `Không tìm thấy ${email}!`,
    });
  }

  // Email đúng
  const verifyPassword = await argon2.verify(
    verifyEmail[0].PasswordUser,
    password
  );

  console.log("MKL: ", verifyPassword);
  console.log("verifyEmail[0]: ", verifyEmail[0]);

  if (!verifyPassword) {
    return res.status(500).json({
      success: false,
      message: "Mật khẩu sai!",
    });
  }

  const token = jwt.sign(
    {
      IDUser: verifyEmail.IDUser,
      RoleID: verifyEmail.RoleID,
      NameUser: verifyEmail.NameUser,
    },
    process.env.PASSJWT
  );

  console.log("DNTC");

  return res.status(200).json({
    dataUser: verifyEmail[0],
    success: true,
    message: "Đăng nhập thành công!",
    token,
  });
  // }, delay);
};

const registerUsers = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(req.body);
  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      message: "Không được bỏ trống!",
    });
  }

  try {
    let [existEmail] = await pool.execute(
      "SELECT * FROM users where emailUser = ? and TTUser = 1",
      [email]
    );

    if (existEmail.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Email đã tồn tại!",
      });
    }

    const hashPassword = await argon2.hash(password);
    // Thực hiện chèn người dùng mới vào cơ sở dữ liệu
    let [result] = await pool.execute(
      "insert into users(NameUser, EmailUser, PasswordUser, RoleID) values (?, ?, ?, ?)",
      [name, email, hashPassword, "user"]
    );

    // Lấy thông tin người dùng vừa được chèn dựa trên insertId
    let [newUser] = await pool.execute(
      "SELECT IDUser, NameUser, EmailUser, RoleID FROM users WHERE IDUser = ?",
      [result.insertId]
    );

    if (newUser.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không tìm thấy thông tin người dùng!",
      });
    }

    // Tạo token JWT
    const token = jwt.sign(
      {
        IDUser: newUser[0].IDUser,
        RoleID: newUser[0].RoleID,
        NameUser: newUser[0].NameUser,
      },
      process.env.PASSJWT
    );

    // Trả về thông tin người dùng và token
    return res.status(200).json({
      success: true,
      message: "Đăng ký thành công!",
      token,
      dataUser: newUser[0], // Thông tin người dùng vừa được thêm
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Register failed !!!",
    });
  }
};

const getUserInfo = async (req, res) => {
  const IDUser = req.params.IDUser;
  let [userInfo] = await pool.execute(
    "SELECT * FROM users where IDUser = ? and TTUser = 1",
    [IDUser]
  );

  if (userInfo.length === 0)
    return res.send(400).json({
      success: false,
      message: "Không tìm thấy người dùng!",
    });

  return res.status(200).json({
    success: true,
    message: "Lấy thông tin cá nhân thành công!",
    dataUser: userInfo[0],
  });
};

const editUser = async (req, res) => {
  const IDUser = req.params.IDUser;
  const { NameUser, EmailUser } = req.body;

  try {
    // Lấy thông tin user từ database
    let [userInfo] = await pool.execute(
      "SELECT * FROM users WHERE IDUser = ? AND TTUser = 1",
      [IDUser]
    );

    if (userInfo.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }

    await pool.execute(
      "UPDATE users SET NameUser = ?, EmailUser = ? WHERE IDUser = ?",
      [NameUser, EmailUser, IDUser]
    );

    return res.json({
      success: true,
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

const DoiMatKhau = async (req, res) => {
  const IDUser = req.params.IDUser;
  const { oldPassword, newPassword } = req.body;
  console.log(req.body);

  try {
    // Lấy thông tin user từ database
    let [userInfo] = await pool.execute(
      "SELECT * FROM users WHERE IDUser = ? AND TTUser = 1",
      [IDUser]
    );

    if (userInfo.length === 0) {
      console.log("Không tìm thấy người dùng!");
      return res.status(500).json({
        success: false,
        message: "Không tìm thấy người dùng!",
      });
    }

    // Kiểm tra mật khẩu cũ
    const isPasswordValid = await argon2.verify(
      userInfo[0].PasswordUser,
      oldPassword
    );

    if (!isPasswordValid) {
      console.log("Mật khẩu cũ không đúng!");
      return res.status(500).json({
        success: false,
        message: "Mật khẩu cũ không đúng!",
      });
    }

    // Mã hóa mật khẩu mới
    const hashPasswordNew = await argon2.hash(newPassword);

    const updateResult = await pool.execute(
      "UPDATE users SET PasswordUser = ? WHERE IDUser = ?",
      [hashPasswordNew, IDUser]
    );
    console.log("Cập nhật thành công!");

    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

const getUserQuiz = async (req, res) => {
  const search = req.query.search || "";
  const IDUser = req.params.IDUser;
  // console.log("search bthi:", search);

  try {
    let query = `
      SELECT thongtinbaithi.PassCode, thongtinbaithi.IDPass, baithi.TenBaiThi, baithi.AnhBaiThi,users.NameUser, 
             COUNT(ketqua.IDKetQua) AS SoLanThi, 
             MAX(ketqua.TongDiem) AS DiemCaoNhat
      FROM ketqua 
      INNER JOIN thongtinbaithi ON thongtinbaithi.IDPass = ketqua.IDPass
      INNER JOIN baithi ON thongtinbaithi.IDBaiThi = baithi.IDBaiThi
      INNER JOIN users ON users.IDUser = baithi.IDUser
      WHERE ketqua.IDUser = ?`;

    let queryParams = [IDUser];

    if (search.trim()) {
      query += " AND (baithi.TenBaiThi LIKE ? OR users.NameUser LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Nhóm lại theo IDPass và IDUser
    query += " GROUP BY ketqua.IDPass, ketqua.IDUser";

    const [userInfo] = await pool.execute(query, queryParams);

    console.log(userInfo);

    return res.status(200).json({
      success: true,
      dataBT: userInfo,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

const SoLanThi = async (req, res) => {
  const IDUser = req.params.IDUser;
  const PassCode = req.params.PassCode;

  try {
    let query =
      "SELECT * FROM ketqua, thongtinbaithi, baithi WHERE thongtinbaithi.IDBaiThi = baithi.IDBaiThi and thongtinbaithi.IDPass = ketqua.IDPass and ketqua.IDUser = ? and thongtinbaithi.PassCode = ?";
    let queryParams = [IDUser, PassCode];

    const [userInfo] = await pool.execute(query, queryParams);

    console.log(userInfo);

    return res.status(200).json({
      success: true,
      dataBT: userInfo,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

const getAllQuiz = async (req, res) => {
  const search = req.query.search || "";
  console.log("search bthi:", search);

  try {
    let query =
       "SELECT * FROM thongtinbaithi, baithi, users WHERE users.IDUser = baithi.IDUser and thongtinbaithi.IDBaiThi = baithi.IDBaiThi";
    let queryParams = [];
    // and baithi.TTBaiThi = 1 and baithi.TTPassCode = 0

    if (search.trim()) {
      query += " AND (baithi.TenBaiThi LIKE ? OR users.NameUser LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const [userInfo] = await pool.execute(query, queryParams);

    console.log("DLSDK", userInfo);

    // if (userInfo.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Không có bài thi nào!",
    //   });
    // }

    return res.status(200).json({
      success: true,
      dataBT: userInfo,
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!",
    });
  }
};

// const getAllQuiz = async (req, res) => {
//   const search = req.query.search || "";
//   console.log("search bthi:", search);

//   try {
//     let query =
//       "SELECT * FROM thongtinbaithi, baithi, users WHERE users.IDUser = baithi.IDUser and baithi.TTBaiThi = 1 and baithi.TTPassCode = 0 and thongtinbaithi.IDBaiThi = baithi.IDBaiThi";
//     let queryParams = [];

//     if (search.trim()) {
//       query += " AND (baithi.TenBaiThi LIKE ? OR users.NameUser LIKE ?)";
//       queryParams.push(`%${search}%, %${search}%`);
//     }

//     const [userInfo] = await pool.execute(query, queryParams);

//     return res.status(200).json({
//       success: true,
//       dataBT: userInfo,
//     });
//   } catch (error) {
//     console.error("Error fetching quizzes:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Lỗi server!",
//     });
//   }
// };

const getOneQuiz = async (req, res) => {
  const IDBaiThi = req.params.IDBaiThi;
  const PassCode = req.params.PassCode;

  try {
    // Truy xuất danh sách bài thi
    let [BaiThi] = await pool.execute(
      "SELECT * FROM noidungbaithi, baithi, thongtinbaithi WHERE baithi.IDBaiThi = ? and baithi.IDBaiThi = thongtinbaithi.IDBaiThi and noidungbaithi.IDBaiThi =  baithi.IDBaiThi and thongtinbaithi.PassCode = ?",
      [IDBaiThi, PassCode]
    );

    // console.log(BaiThi);

    if (BaiThi.length === 0) {
      return res.status(200).json({
        success: false,
        dataBT: [],
        message: "Không có bài thi nào!",
      });
    }

    // Truy xuất câu trả lời cho từng bài thi
    for (let bai of BaiThi) {
      let [CauTraLoi] = await pool.execute(
        "SELECT * FROM dapan WHERE IDNoiDung = ?",
        [bai.IDNoiDung]
      );
      bai.CauTraLoi = CauTraLoi; // Gắn câu trả lời vào từng bài thi
    }

    return res.status(200).json({
      success: true,
      message: "Lấy nội dung bài thi thành công!",
      TenBaiThi: BaiThi[0].TenBaiThi,
      TgThi: BaiThi[0].TgThi,
      dataBT: BaiThi,
      Diem: BaiThi[0].Diem,
      IDUser: BaiThi[0].IDUser,
    });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return res.status(400).json({
      success: false,
      message: "Lấy nội dung bài thi không thành công!",
    });
  }
};

const submitQuiz = async (req, res) => {
  const IDUser = req.params.IDUser;
  const IDBaiThi = req.params.IDBaiThi;
  const PassCode = req.params.PassCode;

  const userAnswers = req.body.formData.userAnswers;
  const totalTimeSpent = req.body.formData.totalTimeSpent;

  const [TTPassCode] = await pool.execute(
    "SELECT IDPass FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
    [IDBaiThi, PassCode]
  );

  const [DiemThi] = await pool.execute(
    "SELECT Diem FROM baithi WHERE IDBaiThi = ?",
    [IDBaiThi]
  );

  const TgNopBai = new Date();
  const TgNopBaiInLocalTime = convertUTCToLocalTime(TgNopBai);
  try {
    let score = 0;
    // Lưu từng câu trả lời vào bảng CauTraLoi
    for (const [IDNoiDung, IDDapAn] of Object.entries(userAnswers)) {
      const [rows] = await pool.execute(
        "SELECT Dung FROM dapan WHERE IDNoiDung = ? and IDDapAn = ?",
        [IDNoiDung, IDDapAn]
      );

      // console.log("Cau hoi: ", rows);
      const DungSai = rows.length > 0 && rows[0].Dung === 1 ? 1 : 0;

      if (DungSai === 1) {
        score++;
      }

      await pool.execute(
        "INSERT INTO CauTraLoi (IDUser, IDNoiDung, DapAn, DungSai, TgNopBai) VALUES (?, ?, ?, ?, ?)",
        [IDUser, IDNoiDung, IDDapAn, DungSai, TgNopBai]
      );
    }

    const tongdiem = DiemThi[0].Diem * score;

    await pool.execute(
      "INSERT INTO ketqua (IDUser, TongDiem, TgThucHien, IDPass, TgNopBai) VALUES (?, ?, ?, ?, ?)",
      [IDUser, tongdiem, totalTimeSpent, TTPassCode[0].IDPass, TgNopBai]
    );

    return res.status(200).json({
      success: true,
      message: "Đã nộp bài!",
      TgNopBai: TgNopBaiInLocalTime,
      // count: count,
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    return res.status(400).json({
      success: false,
      message: "Nộp bài không thành công!",
    });
  }
};

const ketQuaThi = async (req, res) => {
  const IDUser = req.params.IDUser;
  const PassCode = req.params.PassCode;
  const IDBaiThi = req.params.IDBaiThi;
  const TgNopBaiInLocalTime = req.params.TgNopBai;

  console.log("Dsdsd: ", req.params);
  // console.log("TgNopBai", TgNopBai)
  // const TgNopBaiInLocalTime = convertUTCToLocalTime(TgNopBai);

  const [TTPassCode] = await pool.execute(
    "SELECT IDPass FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
    [IDBaiThi, PassCode]
  );

  try {
    let [CauTraLoi] = await pool.execute(
      `SELECT cautraloi.* 
       FROM cautraloi, noidungbaithi, baithi, thongtinbaithi
       WHERE thongtinbaithi.IDBaiThi = baithi.IDBaiThi 
       AND baithi.IDBaiThi = noidungbaithi.IDBaiThi 
       AND noidungbaithi.IDNoiDung = cautraloi.IDNoiDung 
       AND cautraloi.IDUser = ? 
       AND thongtinbaithi.PassCode = ? 
       AND thongtinbaithi.IDBaiThi = ? 
       AND cautraloi.TgNopBai = ? `,
      [IDUser, PassCode, IDBaiThi, TgNopBaiInLocalTime]
    );

    // Truy xuất diem
    let [DiemThi] = await pool.execute(
      "SELECT * FROM ketqua, thongtinbaithi WHERE ketqua.IDPass = thongtinbaithi.IDPass and thongtinbaithi.PassCode = ? and ketqua.IDUser = ? and ketqua.TgNopBai = ?",
      [PassCode, IDUser, TgNopBaiInLocalTime]
    );

    let [ThongTin] = await pool.execute(
      "SELECT * FROM users where IDUser = ?",
      [IDUser]
    );

    // console.log("Diem Thi:", DiemThi)
    // console.log("CauTâsaL:", CauTraLoi)

    return res.status(200).json({
      dataDiemThi: DiemThi,
      dataCTL: CauTraLoi,
      ThongTin: ThongTin,
    });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return res.status(400).json({
      success: false,
      message: "Lấy nội dung bài thi không thành công!",
    });
  }
};

const layDSKQThi = async (req, res) => {
  const { IDUser, PassCode, IDBaiThi } = req.params;

  console.log(IDUser, PassCode, IDBaiThi, "IDUser laydskqbaithi");

  let [TTPassCode] = await pool.execute(
    "SELECT IDPass FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
    [IDBaiThi, PassCode]
  );

  console.log(TTPassCode, "TTPassCode");

  // Check if TTPassCode contains data and extract IDPass
  if (TTPassCode.length > 0) {
    const IDPass1 = TTPassCode[0].IDPass;
    console.log(IDPass1, "IDPass1");

    try {
      // Truy xuất diem
      let [DiemThi] = await pool.execute(
        "SELECT * FROM ketqua where ketqua.IDPass = ?",
        [IDPass1]
      );

      let [ThongTin] = await pool.execute(
        "SELECT * FROM users where IDUser = ?",
        [IDUser]
      );

      return res.status(200).json({
        dataDiemThi: DiemThi,
        ThongTin: ThongTin,
      });
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      return res.status(400).json({
        success: false,
        message: "Lấy nội dung bài thi không thành công!",
      });
    }
  } else {
    console.error("No IDPass found.");
    return res.status(404).json({
      success: false,
      message:
        "Không tìm thấy thông tin bài thi với PassCode và IDBaiThi đã cho.",
    });
  }
};

const layDSKQMotBaiThi = async (req, res) => {
  const { IDBaiThi, PassCode } = req.params;

  console.log(PassCode, IDBaiThi, "IDUser layDSKQMotBaiThi");

  let [TTPassCode] = await pool.execute(
    "SELECT IDPass FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
    [IDBaiThi, PassCode]
  );

  console.log(TTPassCode, "TTPassCode");

  // Check if TTPassCode contains data and extract IDPass
  if (TTPassCode.length > 0) {
    const IDPass1 = TTPassCode[0].IDPass;
    console.log(IDPass1, "IDPass1");

    try {
      // Truy xuất diem
      let [DiemThi] = await pool.execute(
        "SELECT * FROM ketqua, users where ketqua.IDPass = ? and ketqua.IDUser = users.IDUser",
        [IDPass1]
      );

      console.log("Diem thi >>>", DiemThi);
      return res.status(200).json({
        dataDiemThi: DiemThi,
      });
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      return res.status(400).json({
        success: false,
        message: "Lấy nội dung bài thi không thành công!",
      });
    }
  } else {
    console.error("No IDPass found.");
    return res.status(404).json({
      success: false,
      message:
        "Không tìm thấy thông tin bài thi với PassCode và IDBaiThi đã cho.",
    });
  }
};

const getOneQuizSubmited = async (req, res) => {
  const IDUser = req.params.IDUser;
  const PassCode = req.params.PassCode;
  const IDBaiThi = req.params.IDBaiThi;
  const TgNopBai = req.params.TgNopBai;

  console.log("Dsdsd: ", req.params);
  // console.log("TgNopBai", TgNopBai)
  const TgNopBaiInLocalTime = convertUTCToLocalTime(TgNopBai);

  const [TTPassCode] = await pool.execute(
    "SELECT IDPass FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
    [IDBaiThi, PassCode]
  );

  try {
    let [CauTraLoi] = await pool.execute(
      `SELECT cautraloi.* 
       FROM cautraloi, noidungbaithi, baithi, thongtinbaithi
       WHERE thongtinbaithi.IDBaiThi = baithi.IDBaiThi 
       AND baithi.IDBaiThi = noidungbaithi.IDBaiThi 
       AND noidungbaithi.IDNoiDung = cautraloi.IDNoiDung 
       AND cautraloi.IDUser = ? 
       AND thongtinbaithi.PassCode = ? 
       AND thongtinbaithi.IDBaiThi = ? 
       AND cautraloi.TgNopBai = ? `,
      [IDUser, PassCode, IDBaiThi, TgNopBaiInLocalTime]
    );

    // Truy xuất diem
    let [DiemThi] = await pool.execute(
      "SELECT * FROM ketqua, thongtinbaithi WHERE ketqua.IDPass = thongtinbaithi.IDPass and thongtinbaithi.PassCode = ? and ketqua.IDUser = ? and ketqua.TgNopBai = ?",
      [PassCode, IDUser, TgNopBaiInLocalTime]
    );

    console.log("Diem Thi:", DiemThi);
    console.log("CauTâsaL:", CauTraLoi);

    return res.status(200).json({
      dataDiemThi: DiemThi,
      dataCTL: CauTraLoi,
    });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return res.status(400).json({
      success: false,
      message: "Lấy nội dung bài thi không thành công!",
    });
  }
};

const searchByCode = async (req, res) => {
  const PassCode = parseInt(req.params.PassCode);

  try {
    let [result] = await pool.execute(
      "SELECT * FROM users, baithi, thongtinbaithi, noidungbaithi where users.IDUser = baithi.IDUser and baithi.IDBaiThi = thongtinbaithi.IDBaiThi and baithi.IDBaiThi = noidungbaithi.IDBaiThi and baithi.TTBaiThi = 1 and thongtinbaithi.PassCode = ? and thongtinbaithi.MoDong = 1",
      [PassCode]
    );

    // console.log("Search PassCode:", result);

    if (result.length > 0) {
      return res.status(200).json({
        dataBaiThi: result, // Gửi dữ liệu bài thi về frontend
      });
    } else {
      return res.status(404).json({
        message: "Không tìm thấy bài thi!", // Sử dụng status 404 để thông báo không tìm thấy
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const CopyQuiz = async (req, res) => {
  console.log(req.body);
  const IDBaiThi = req.params.IDBaiThi;

  try {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000; // Lấy offset múi giờ (trong ms)
    const NgayMo = new Date(now.getTime() - offset)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Truy xuất tất cả các PassCode hiện có
    const [existingPassCodes] = await pool.execute(
      "SELECT PassCode FROM thongtinbaithi"
    );

    // Sinh ngẫu nhiên PassCode 4 số và đảm bảo không trùng lặp
    let newPassCode;
    do {
      newPassCode = Math.floor(1000 + Math.random() * 9000).toString(); // Sinh số ngẫu nhiên 4 chữ số
    } while (existingPassCodes.some((code) => code.PassCode === newPassCode));

    // Thêm IDBaiThi, PassCode và NgayMo vào bảng thongtinbaithi
    await pool.execute(
      "insert into thongtinbaithi(IDBaiThi, PassCode, NgayMo) values (?, ?, ?)",
      [IDBaiThi, newPassCode, NgayMo]
    );

    console.log("New passcode:", newPassCode);
    res.status(200).json({
      success: true,
      PassCode: newPassCode,
      message: "Làm mới bài thi thành công!",
    });
  } catch (error) {
    console.log("Thêm mới thất bại!", error);
    return res.status(500).json({
      success: false,
      message: "Thêm mới thất bại!",
    });
  }
};

const DongBaiThi = async (req, res) => {
  const IDBaiThi = req.params.IDBaiThi;
  const PassCode = req.params.PassCode;
  const MoDong = parseInt(req.params.MoDong);

  console.log("Cap nhat trang thai", IDBaiThi, PassCode, MoDong);

  try {
    if (MoDong === 0) {
      await pool.execute(
        "UPDATE thongtinbaithi SET MoDong = 1 where thongtinbaithi.IDBaiThi = ? and thongtinbaithi.PassCode = ?",
        [IDBaiThi, PassCode]
      );

      // res.status(200).json({
      //   success: true,
      //   message: "Đã mở bài thi!",
      // });
    } else {
      await pool.execute(
        "UPDATE thongtinbaithi SET MoDong = 0 where thongtinbaithi.IDBaiThi = ? and thongtinbaithi.PassCode = ?",
        [IDBaiThi, PassCode]
      );

      // res.status(200).json({
      //   success: true,
      //   message: "Đã đóng bài thi!",
      // });
    }

    res.status(200).json({
      success: true,
      message: "Thành công!",
    });
  } catch (error) {
    console.log("Cập nhật thất bại!", error);
    return res.status(500).json({
      success: false,
      message: "Cập nhật thất bại!",
    });
  }
};

// let guiMaXacNhan = async (req, res) => {
//   let email = req.body.email;
//   // let testAccount = await nodemailer.createTestAccount();
//   const generateVerificationCode = (length) => {
//     // return Math.floor(1000 + Math.random() * 9000).toString();
//     var result = "";
//     var characters =
//       "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     var charactersLength = characters.length;
//     for (var i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
//   };

//   const verificationCode = generateVerificationCode(6);
//   const saltRounds = 10;
//   const pwdHash = await bcrypt.hash(verificationCode, saltRounds);

//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false,
//     service: "gmail",
//     auth: {
//       user: "ld7941682@gmail.com",
//       pass: "ijippjqyfxuyqgxs",
//     },
//   });

//   const [r1, f1] = await pool.execute(
//     "SELECT * FROM doanvien WHERE Email = ?",
//     [email]
//   );
//   console.log(email);
//   if (r1.length == 0) {
//     console.log("Email không ton tai");
//     return res.status(404).json({
//       message: "Email không tồn tại",
//     });
//   }

//   // const [r2, f2] = await pool.execute("UPDATE users set maxacnhan=? where email = ?", [verificationCode, email])
//   const [r2, f2] = await pool.execute(
//     "SELECT Password FROM doanvien WHERE Email = ?",
//     [email]
//   );

//   const old_password = r2[0].Password;
//   // console.log(old_password)
//   await pool.execute("UPDATE doanvien SET Password = ? WHERE Email = ?", [
//     pwdHash,
//     email,
//   ]);
//   const mailOptions = {
//     from: "ld7941682@gmail.com",
//     to: email,
//     subject: "New Password",
//     text: `Your new password is: ${verificationCode}`,
//   };

//   await transporter.sendMail(mailOptions, async function (error, info) {
//     if (error) {
//       console.log(error);
//       await pool.execute("UPDATE doanvien SET Password = ? WHERE Email = ?", [
//         old_password,
//         email,
//       ]);
//       return res.status(404).json({ message: "Kiểm tra lại Email" });
//     } else {
//       console.log("Ok");
//       return res.status(200).json({ message: "Gửi mã thành công!" });
//     }
//   });
// };

let guiMaXacNhan = async (req, res) => {
  let email = req.body.email;

  try {
    // Kiểm tra email có tồn tại hay không
    const [r1] = await pool.execute("SELECT * FROM users WHERE EmailUser = ?", [
      email,
    ]);

    if (r1.length === 0) {
      console.log("Email không tồn tại");
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại",
      });
    }

    // Tạo mã xác nhận
    const generateVerificationCode = (length) => {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return result;
    };

    const verificationCode = generateVerificationCode(6);

    // Mã hóa mã xác nhận bằng argon2
    const hashPasswordNew = await argon2.hash(verificationCode);

    // Tạo transporter để gửi email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      service: "gmail",
      auth: {
        user: "ld7941682@gmail.com",
        pass: "ijippjqyfxuyqgxs",
      },
    });

    // Gửi email chứa mã xác nhận
    const mailOptions = {
      from: "ld7941682@gmail.com",
      to: email,
      subject: "Mã xác nhận mới",
      text: `Mã xác nhận của bạn là: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, async function (error, info) {
      if (error) {
        console.log("Lỗi gửi email:", error);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi gửi email. Vui lòng thử lại.",
        });
      } else {
        // Cập nhật mật khẩu trong cơ sở dữ liệu khi email gửi thành công
        await pool.execute(
          "UPDATE users SET PasswordUser = ? WHERE EmailUser = ?",
          [hashPasswordNew, email]
        );
        console.log("Gửi mã thành công!");
        return res
          .status(200)
          .json({ success: true, message: "Gửi mã thành công!" });
      }
    });
  } catch (error) {
    console.log("Lỗi server:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
    });
  }
};

module.exports = {
  getAllQuiz,
  getOneQuiz,
  getOneQuizSubmited,
  searchByCode,
  getUserQuiz,
  SoLanThi,
  submitQuiz,
  ketQuaThi,
  CopyQuiz,
  DongBaiThi,
  layDSKQThi,
  layDSKQMotBaiThi,
  loginUsers,
  registerUsers,
  getUserInfo,
  editUser,
  DoiMatKhau,
  guiMaXacNhan,
};
