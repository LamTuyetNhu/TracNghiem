import pool from "../configs/connectDB";
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
function convertDateFormat(dateString) {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
}

// User
const CreateUser = async (req, res) => {
  console.log(req.body.email);
  const { name, email, password, role } = req.body;

  if (!email || !name || !password) {
    console.log("Không được bỏ trống!");
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
      console.log("Email đã tồn tại!");
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại!",
      });
    }

    const hashPassword = await argon2.hash(password);
    let [newUser] = await pool.execute(
      "insert into users(NameUser, EmailUser, PasswordUser, RoleID) values (?, ?, ?, ?)",
      [name, email, hashPassword, role]
    );

    console.log("Thêm mới thành công!");
    return res.status(200).json({
      success: true,
      message: "Thêm mới thành công!",
    });
  } catch (error) {
    console.log("Thêm mới thất bại!", error);
    return res.status(500).json({
      success: false,
      message: "Thêm mới thất bại!",
    });
  }
};

const getAllUsers = async (req, res) => {
  const page = parseInt(req.params.page);
  const pageSize = parseInt(req.params.pageSize);

  const search = req.params.search ? req.params.search : ""; // Lấy tham số tìm kiếm, mặc định là chuỗi rỗng nếu không có
  console.log(page, pageSize, search);

  try {
    let query = "SELECT * FROM users WHERE 1=1";
    let countQuery = "SELECT COUNT(*) AS totalCount FROM users WHERE 1=1";
    let queryParams = [];
    let countParams = [];

    // Thêm điều kiện tìm kiếm
    if (search) {
      query += " AND (NameUser LIKE ? OR emailUser LIKE ?)";
      countQuery += " AND (NameUser LIKE ? OR emailUser LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Đếm tổng số bài thi
    const [totalBaiThi] = await pool.execute(countQuery, countParams);
    const totalCount = totalBaiThi[0].totalCount;

    // Lấy danh sách người dùng
    const [allUsers] = await pool.execute(query, queryParams);

    // Tính toán các giá trị phân trang
    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      dataUser: paginatedUsers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const deleteUser = async (req, res) => {
  const IDUser = req.params.IDUser;
  console.log(IDUser);
  try {
    if (!IDUser) {
      return res.status(500).json({
        success: false,
        message: "Có lỗi khi xóa!",
      });
    }

    let [BaiThi] = await pool.execute("SELECT * FROM baithi where IDUser = ?", [
      IDUser,
    ]);

    if (BaiThi.length > 0) {
      BaiThi.forEach((baithi) => {
        let [NoiDungBaiThi] = pool.execute(
          "SELECT * FROM noidungbaithi where IDBaiThi = ?",
          [baithi.IDBaiThi]
        );

        if (NoiDungBaiThi.length > 0) {
          NoiDungBaiThi.forEach((noidung) => {
            pool.execute("DELETE FROM dapan WHERE IDNoiDung = ?", [
              noidung.IDNoiDung,
            ]);
          });
        }

        pool.execute("DELETE FROM noidungbaithi WHERE IDNoiDung = ?", [
          baithi.IDBaiThi,
        ]);
      });
    }

    await pool.execute("DELETE FROM BAITHI WHERE IDUSER = ?", [IDUser]);

    await pool.execute("DELETE FROM DANGKYBAITHI WHERE IDUSER = ?", [IDUser]);

    await pool.execute("DELETE FROM USERS WHERE IDUSER = ?", [IDUser]);

    return res.status(200).json({
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra!",
    });
  }
};

// Danh sách bài thi
const getAllQuiz = async (req, res) => {
  const page = parseInt(req.params.page);
  const pageSize = parseInt(req.params.pageSize);
  const TTBaiThi = parseInt(req.params.TTBaiThi);
  const offset = (page - 1) * pageSize;
  const search = req.params.search ? req.params.search : ""; // Lấy tham số tìm kiếm, mặc định là chuỗi rỗng nếu không có
  console.log(page, pageSize, offset, TTBaiThi, search);

  try {
    // Cập nhật trạng thái bài thi có NgayKetThuc nhỏ hơn ngày hiện tại
    // await pool.execute(
    //   "UPDATE baithi SET baithi.TTBaiThi = 2 WHERE baithi.TgKetThuc < CURDATE() AND baithi.TTBaiThi <> 0"
    // );

    let query =
      "SELECT * FROM thongtinbaithi, baithi, users WHERE 1=1 and users.IDuser = baithi.IDUser and thongtinbaithi.IDBaiThi = baithi.IDBaiThi";
    let countQuery =
      "SELECT COUNT(*) AS totalCount FROM baithi, users WHERE 1=1 and users.IDuser = baithi.IDUser";
    let queryParams = [];
    let countParams = [];

    // Thêm điều kiện tìm kiếm
    if (search) {
      query += " AND (baithi.TenBaiThi LIKE ? OR users.NameUser LIKE ?)";
      countQuery += " AND (baithi.TenBaiThi LIKE ? OR users.NameUser LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Thêm điều kiện lọc theo TTBaiThi
    if (TTBaiThi !== 3) {
      // 3 tương đương với "Tất cả trạng thái"
      query += " AND baithi.TTBaiThi = ?";
      countQuery += " AND baithi.TTBaiThi = ?";
      queryParams.push(TTBaiThi);
      countParams.push(TTBaiThi);
    }

    query += " ORDER BY FIELD(baithi.TTBaiThi, 1, 2, 0) LIMIT ? OFFSET ?";
    queryParams.push(pageSize, offset);

    // Đếm tổng số bài thi
    const [totalBaiThi] = await pool.execute(countQuery, countParams);
    const totalCount = totalBaiThi[0].totalCount;

    // Lấy danh sách bài thi đã được sắp xếp theo TTBaiThi (1, 2, 0)
    const [BaiThi] = await pool.execute(query, queryParams);

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      dataBaiThi: BaiThi,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const getAllQuizOfUser = async (req, res) => {
  const page = parseInt(req.params.page);
  const pageSize = parseInt(req.params.pageSize);
  // const TTBaiThi = parseInt(req.params.TTBaiThi);
  const IDUser = parseInt(req.params.IDUser);
  const offset = (page - 1) * pageSize;
  const search = req.params.search ? req.params.search : ""; // Lấy tham số tìm kiếm, mặc định là chuỗi rỗng nếu không có
  console.log(page, pageSize, offset, search);

  try {
    let query =
      "SELECT * FROM thongtinbaithi, baithi, users WHERE 1=1 and users.IDuser = baithi.IDUser and thongtinbaithi.IDBaiThi = baithi.IDBaiThi and baithi.IDUSer = ?";
    let countQuery =
      "SELECT COUNT(*) AS totalCount FROM thongtinbaithi, baithi, users WHERE 1=1 and users.IDuser = baithi.IDUser and thongtinbaithi.IDBaiThi = baithi.IDBaiThi and baithi.IDUSer = ?";

    // Thêm IDUser vào cả query và countQuery
    let queryParams = [IDUser];
    let countParams = [IDUser];

    // Thêm điều kiện tìm kiếm
    if (search) {
      query +=
        " AND (baithi.TenBaiThi LIKE ? OR thongtinbaithi.PassCode LIKE ? )";
      countQuery +=
        " AND (baithi.TenBaiThi LIKE ? OR thongtinbaithi.PassCode LIKE ? )";
      queryParams.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY FIELD(baithi.TTBaiThi, 1, 0) LIMIT ? OFFSET ?";
    queryParams.push(pageSize, offset);

    // Đếm tổng số bài thi
    const [totalBaiThi] = await pool.execute(countQuery, countParams);
    const totalCount = totalBaiThi[0].totalCount;

    // Lấy danh sách bài thi đã được sắp xếp theo TTBaiThi (1, 2, 0)
    const [BaiThi] = await pool.execute(query, queryParams);

        // Kiểm tra sự tồn tại của BaiThi.IDPass trong bảng ketqua
        for (const baiThi of BaiThi) {
          const [ketQuaExists] = await pool.execute(
            "SELECT * FROM ketqua WHERE IDPass = ? LIMIT 1",
            [baiThi.IDPass]
          );
    
          if (ketQuaExists.length > 0) {
            await pool.execute(
              "UPDATE thongtinbaithi SET MoDong = 0 WHERE IDPass = ?",
              [baiThi.IDPass]
            );
          }
        }

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      dataBaiThi: BaiThi,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

const deleteQuiz = async (req, res) => {
  const IDBaiThi = req.params.IDBaiThi;
  const PassCode = req.params.PassCode;

  console.log(IDBaiThi, "IDBaiThi");
  try {
    if (!IDBaiThi) {
      return res.status(500).json({
        success: false,
        message: "Có lỗi khi xóa!",
      });
    }

    let [SoBaiThi] = await pool.execute(
      "SELECT IDPass FROM thongtinbaithi where IDBaiThi = ?",
      [IDBaiThi]
    );

    if (SoBaiThi.length !== 1) {
      let [KQBaiThi] = await pool.execute(
        "SELECT IDPass FROM thongtinbaithi where IDBaiThi = ? and PassCode = ?",
        [IDBaiThi, PassCode]
      );
  
      if (KQBaiThi.length > 0) {
        KQBaiThi.forEach((noidung) => {
          pool.execute("DELETE FROM ketqua WHERE IDPass = ?", [noidung.IDPass]);
        });
      }
  
      await pool.execute(
        "DELETE FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
        [IDBaiThi, PassCode]
      );
    } else {
      let [NoiDungBaiThi] = await pool.execute(
        "SELECT IDNoiDung FROM noidungbaithi where IDBaiThi = ?",
        [IDBaiThi]
      );

      if (NoiDungBaiThi.length > 0) {
        NoiDungBaiThi.forEach((noidung) => {
          pool.execute("DELETE FROM cautraloi WHERE IDNoiDung = ?", [
            noidung.IDNoiDung,
          ]);
        });

        NoiDungBaiThi.forEach((noidung) => {
          pool.execute("DELETE FROM dapan WHERE IDNoiDung = ?", [
            noidung.IDNoiDung,
          ]);
        });

        NoiDungBaiThi.forEach((noidung) => {
          pool.execute("DELETE FROM noidungbaithi WHERE IDNoiDung = ?", [
            noidung.IDNoiDung,
          ]);
        });
      }

      let [KQBaiThi] = await pool.execute(
        "SELECT IDPass FROM thongtinbaithi where IDBaiThi = ? and PassCode = ?",
        [IDBaiThi, PassCode]
      );
  
      if (KQBaiThi.length > 0) {
        KQBaiThi.forEach((noidung) => {
          pool.execute("DELETE FROM ketqua WHERE IDPass = ?", [noidung.IDPass]);
        });
      }
  
      await pool.execute(
        "DELETE FROM thongtinbaithi WHERE IDBaiThi = ? and PassCode = ?",
        [IDBaiThi, PassCode]
      );

      await pool.execute("DELETE FROM baithi WHERE IDBaiThi = ?", [IDBaiThi]);
    }

    return res.status(200).json({
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra!",
    });
  }
};

const CreateQuiz = async (req, res) => {
  console.log(req.body);
  const { TenBaiThi, TenTacGia, NgayBatDau, NgayKetThuc, IDUser } = req.body;

  if (!TenBaiThi || !TenTacGia || !NgayBatDau || !NgayKetThuc) {
    console.log("Không được bỏ trống!");
    return res.status(400).json({
      success: false,
      message: "Không được bỏ trống!",
    });
  }

  const formatNgayBatDau = convertDateFormat(NgayBatDau);
  const formatNgayKetThuc = convertDateFormat(NgayKetThuc);

  try {
    let [newQuiz] = await pool.execute(
      "insert into baithi(TenBaiThi, TgThi, TgBatDau, TgKetThuc, IDUser) values (?, ?, ?, ?, ?)",
      [TenBaiThi, TenTacGia, formatNgayBatDau, formatNgayKetThuc, IDUser]
    );

    console.log("Thêm mới thành công!");
    return res.status(200).json({
      success: true,
      message: "Thêm mới thành công!",
    });
  } catch (error) {
    console.log("Thêm mới thất bại!", error);
    return res.status(500).json({
      success: false,
      message: "Thêm mới thất bại!",
    });
  }
};

const UpdateQuiz = async (req, res) => {
  console.log(req.body);
  const IDBaiThi = req.params.IDBaiThi;
  const { TenBaiThi, TenTacGia, NgayBatDau, NgayKetThuc } = req.body;

  if (!TenBaiThi || !TenTacGia || !NgayBatDau || !NgayKetThuc) {
    console.log("Không được bỏ trống!");
    return res.status(400).json({
      success: false,
      message: "Không được bỏ trống!",
    });
  }

  const formatNgayBatDau = convertDateFormat(NgayBatDau);
  const formatNgayKetThuc = convertDateFormat(NgayKetThuc);

  try {
    let [updateQuiz] = await pool.execute(
      "update baithi set TenBaiThi = ?, TgThi = ?, TgBatDau = ?, TgKetThuc = ?, TTBaiThi = 1 where IDBaiThi = ?",
      [TenBaiThi, TenTacGia, formatNgayBatDau, formatNgayKetThuc, IDBaiThi]
    );

    console.log("Cập nhật thành công!");
    return res.status(200).json({
      success: true,
      message: "Cập nhật thành công!",
    });
  } catch (error) {
    console.log("Cập nhật thất bại!", error);
    return res.status(500).json({
      success: false,
      message: "Cập nhật thất bại!",
    });
  }
};

const DisableQuiz = async (req, res) => {
  const IDBaiThi = req.params.IDBaiThi;

  try {
    let [BaiThi] = await pool.execute(
      "SELECT * FROM baithi where IDBaiThi = ?",
      [IDBaiThi]
    );

    console.log("DSFS:", BaiThi.TTBaiThi);

    if (BaiThi[0].TTBaiThi === 0) {
      await pool.execute("update baithi set TTBaiThi = 1 where IDBaiThi = ?", [
        IDBaiThi,
      ]);

      console.log("Đã mở lại bài thi!");
      return res.status(200).json({
        success: true,
        message: "Đã mở lại bài thi!",
      });
    } else {
      await pool.execute("update baithi set TTBaiThi = 0 where IDBaiThi = ?", [
        IDBaiThi,
      ]);

      console.log("Đã vô hiệu hóa!");
      return res.status(200).json({
        success: true,
        message: "Đã vô hiệu hóa!",
      });
    }
  } catch (error) {
    console.log("Vô hiệu hóa thất bại!", error);
    return res.status(500).json({
      success: false,
      message: "Thao tác thất bại!",
    });
  }
};

// Câu hỏi của bài thi
const GetOneQuiz = async (req, res) => {
  const IDBaiThi = req.params.IDBaiThi;
  console.log(IDBaiThi);

  try {
    let [Quiz] = await pool.execute(
      "SELECT * FROM baithi, thongtinbaithi WHERE thongtinbaithi.IDBaiThi = baithi.IDBaiThi and baithi.IDBaiThi = ? ",
      [IDBaiThi]
    );
    // Truy xuất danh sách bài thi
    let [BaiThi] = await pool.execute(
      "SELECT * FROM noidungbaithi WHERE IDBaiThi = ?",
      [IDBaiThi]
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
      bai.CauTraLoi = CauTraLoi;
    }

    // console.log(BaiThi, 'BaiThi');

    return res.status(200).json({
      data: {
        success: true,
        message: "Lấy nội dung bài thi thành công!",
        dataBT: BaiThi,
        BT: Quiz,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return res.status(400).json({
      success: false,
      message: "Lấy nội dung bài thi không thành công!",
    });
  }
};

const deleteAnswer = async (req, res) => {
  const IDDapAn = req.params.IDDapAn;
  const IDNoiDung = req.params.IDNoiDung;
  console.log(IDDapAn, IDNoiDung);
  try {
    if (!IDDapAn) {
      return res.status(500).json({
        success: false,
        message: "Có lỗi khi xóa!",
      });
    }

    let [DapAn] = await pool.execute(
      "SELECT IDDapAn, IDNoiDung FROM dapan where IDDapAn = ? and IDNoiDung = ?",
      [IDDapAn, IDNoiDung]
    );

    if (DapAn.length > 0) {
      DapAn.forEach((noidung) => {
        pool.execute("DELETE FROM dapan WHERE IDDapAn = ? and IDNoiDung = ?", [
          noidung.IDDapAn,
          noidung.IDNoiDung,
        ]);
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Xóa thất bại!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra!",
    });
  }
};

const deleteQuestion = async (req, res) => {
  const IDNoiDung = req.params.IDNoiDung;
  console.log(IDNoiDung);
  try {
    if (!IDNoiDung) {
      return res.status(500).json({
        success: false,
        message: "Không lấy được ID câu hỏi!",
      });
    }

    let [DapAn] = await pool.execute(
      "SELECT IDDapAn FROM dapan where IDNoiDung = ?",
      [IDNoiDung]
    );

    if (DapAn.length > 0) {
      DapAn.forEach((noidung) => {
        pool.execute("DELETE FROM dapan WHERE IDDapAn = ?", [noidung.IDDapAn]);
      });
    }

    pool.execute("DELETE FROM noidungbaithi WHERE IDNoiDung = ?", [IDNoiDung]);

    return res.status(200).json({
      success: true,
      message: "Xóa thành công!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra!",
    });
  }
};

module.exports = {
  CreateUser,
  getAllUsers,
  deleteUser,
  getAllQuiz,
  getAllQuizOfUser,
  deleteQuiz,
  CreateQuiz,
  UpdateQuiz,
  DisableQuiz,
  GetOneQuiz,
  deleteAnswer,
  deleteQuestion,
};
