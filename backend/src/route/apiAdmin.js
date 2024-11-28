const express = require("express");
const route = express.Router();
const APIController = require("../controller/APIAdmin");
const checkAdmin = require("../middleware/checkAdmin");
const multer = require("multer");
import pool from "../configs/connectDB";
const path = require("path");
const fs = require("fs");
const controller = require("../controller/APIUser");
route.get(
    "/users/:pageSize/:page/:search?",
    APIController.getAllUsers
); //checkAdmin
route.post("/user/:IDUser", APIController.deleteUser);
route.post("/addUser", APIController.CreateUser); //checkAdmin

route.get(
    "/quizzes/:pageSize/:page/:TTBaiThi/:search?",
    APIController.getAllQuiz
); //checkAdmin
route.get(
    "/quizzesofuser/:IDUser/:pageSize/:page/:search?",
    APIController.getAllQuizOfUser
);
route.post("/deleteQuiz/:IDBaiThi/:PassCode", APIController.deleteQuiz);
route.post("/addQuiz", APIController.CreateQuiz); //checkAdmin
route.post("/disableQuiz/:IDBaiThi", APIController.DisableQuiz);

//Câu hỏi
route.get("/question/:IDBaiThi", APIController.GetOneQuiz);
route.get("/layDSKQThi/:IDBaiThi/:IDUser/:PassCode", controller.layDSKQThi);

const storage = multer.diskStorage({
    destination: "./src/public/images",
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});


const upload = multer({ storage: storage });

route.post(
    "/addQuestions",
    upload.any(), // Cho phép upload nhiều file với nhiều tên field khác nhau
    async (req, res) => {
        try {
            const { TenBaiThi, selectedTime, selectedPoint, IDUser, TTPassCode, DSCauHoi } = req.body;
            // console.log(AnhBaiThi, 'AnhBaiThi')
            if (!TenBaiThi || !selectedTime || !selectedPoint || !DSCauHoi || !TTPassCode) {
                console.log("Không được bỏ trống!1");
                return res.status(400).json({
                    success: false,
                    message: "Không được bỏ trống!2",
                });
            }

            // Kiểm tra file AnhBaiThi
            const anhBaiThiFile = req.files.find(file => file.fieldname === `AnhBaiThi`);
            const AnhBaiThi = anhBaiThiFile ? anhBaiThiFile.filename : '';
            console.log(AnhBaiThi, 'anhbaithi')

            // Thêm bài thi mới
            let [newQuiz] = await pool.execute(
                "insert into baithi(TenBaiThi, TgThi, Diem, IDUser, TTBaiThi, TTPassCode, AnhBaiThi) values (?, ?, ?, ?, ?, ?, ?)",
                [TenBaiThi, selectedTime, selectedPoint, IDUser, 1, TTPassCode, AnhBaiThi]
            );
            const IDBaiThi = newQuiz.insertId;
            console.log(IDBaiThi, 'idbaithi')

            // Thêm từng câu hỏi vào bảng noidungbaithi
            const DSCauHoiArray = JSON.parse(DSCauHoi); // Chuyển đổi DSCauHoi từ chuỗi JSON sang mảng

            for (const item of DSCauHoiArray) {
                const { IDNoiDung, CauHoi, AnhCauHoi, CauTraLoi } = item;

                // Tìm file ảnh tương ứng với IDNoiDung trong req.files
                const uploadedFile = req.files.find(file => file.fieldname === `AnhCauHoi-${IDNoiDung}`);
                console.log(uploadedFile, 'uploadedFile')
                const fileName = uploadedFile ? uploadedFile.filename : '';
                console.log(fileName, 'fileName')

                await pool.execute(
                    "insert into noidungbaithi(IDNoiDung, IDBaiThi, CauHoi, AnhCauHoi) values (?, ?, ?, ?)",
                    [IDNoiDung, IDBaiThi, CauHoi, fileName]
                );

                // for (const answer of CauTraLoi) {
                //     const { IDDapAn, DapAn, Dung } = answer;

                //     await pool.execute(
                //         "insert into dapan(IDDapAn, IDNoiDung, DapAn, Dung) values (?, ?, ?, ?)",
                //         [IDDapAn, IDNoiDung, DapAn, Dung]
                //     );
                // }

                // Thêm các đáp án
                for (const answer of CauTraLoi) {
                    console.log('vào ')
                    const { IDDapAn, DapAn, Dung, AnhCauTraLoi } = answer;

                    console.log(`Processing answer IDDapAn: ${IDDapAn}`);
                    const answerImageFile = req.files.find(
                        file => file.fieldname === `AnhCauTraLoi-${IDDapAn}`
                    );
                    const answerFileName = answerImageFile ? answerImageFile.filename : "";

                    console.log(`Answer image for ${IDDapAn}: ${answerFileName}`);

                    await pool.execute(
                        "insert into dapan(IDDapAn, IDNoiDung, DapAn, Dung, AnhCauTraLoi) values (?, ?, ?, ?, ?)",
                        [IDDapAn, IDNoiDung, DapAn, Dung, answerFileName]
                    );
                }
            }

            const now = new Date();
            const offset = now.getTimezoneOffset() * 60000;
            const NgayMo = new Date(now.getTime() - offset).toISOString().slice(0, 19).replace('T', ' ');
            // Lấy thời gian hiện tại cho trường NgayMo

            if (TTPassCode === 0) {
                await pool.execute(
                    "insert into thongtinbaithi(IDBaiThi, PassCode, NgayMo) values (?, '', ?)",
                    [IDBaiThi, NgayMo]
                );
            } else {
                // Truy xuất tất cả các PassCode hiện có
                const [existingPassCodes] = await pool.execute("SELECT PassCode FROM thongtinbaithi");

                // Sinh ngẫu nhiên PassCode 4 số và đảm bảo không trùng lặp
                let newPassCode;
                do {
                    newPassCode = Math.floor(1000 + Math.random() * 9000).toString(); // Sinh số ngẫu nhiên 4 chữ số
                } while (existingPassCodes.some(code => code.PassCode === newPassCode));

                // Thêm IDBaiThi, PassCode và NgayMo vào bảng thongtinbaithi
                await pool.execute(
                    "insert into thongtinbaithi(IDBaiThi, PassCode, NgayMo) values (?, ?, ?)",
                    [IDBaiThi, newPassCode, NgayMo]
                );
            }

            res.status(200).json({
                success: true,
                message: "Thêm bài thi thành công!",
            });

        } catch (error) {
            console.error("Thêm bài thi thất bại:", error);
            res.status(500).json({
                succes: false,
                message: "Có lỗi xảy ra khi thêm bài thi"
            });
        }
    }
);

route.post(
    "/updateQuiz/:IDBaiThi",
    upload.any(), // Allow multiple file uploads with different field names
    async (req, res) => {
        try {
            const IDBaiThi = req.params.IDBaiThi;
            const { TenBaiThi, selectedTime, selectedPoint, passcode, DSCauHoi } = req.body;
console.log("Cap nhat: ", req.body)
            if (!IDBaiThi || !TenBaiThi || !selectedTime || !selectedPoint || !passcode || !DSCauHoi) {
                console.log("Không được bỏ trống 1");
                return res.status(400).json({
                    success: false,
                    message: "Không được bỏ trống 2",
                });
            }

            let newImagePathBaiThi = null;

            const uploadedFileBaiThi = req.files.find(file => file.fieldname === `AnhBaiThi`);
            console.log(newImagePathBaiThi, 'newImagePathBaiThi')

            if (uploadedFileBaiThi) {
                // If a new image is uploaded, set newImagePathBaiThi to the filename
                newImagePathBaiThi = uploadedFileBaiThi.filename;
            } 
            // else {
            //     // If no image is uploaded, explicitly set newImagePathBaiThi to an empty string
            //     newImagePathBaiThi = '';
            // }

            // Update the quiz with or without a new image
            await pool.execute(
                "UPDATE baithi SET TenBaiThi = ?, TgThi = ?, Diem = ?, TTPassCode = ?, AnhBaiThi = COALESCE(?, AnhBaiThi) WHERE IDBaiThi = ?",
                [TenBaiThi, selectedTime, selectedPoint, passcode, newImagePathBaiThi, IDBaiThi]
            );

            // If no new image is uploaded and you want to clear the AnhBaiThi field
            // if (!uploadedFileBaiThi && newImagePathBaiThi === '') {
            //     await pool.execute(
            //         "UPDATE baithi SET AnhBaiThi = '' WHERE IDBaiThi = ?",
            //         [IDBaiThi]
            //     );
            // }

            const DSCauHoiArray = JSON.parse(DSCauHoi); // Parse DSCauHoi from JSON string to array

            // Lấy tất cả IDDapAn hiện có trong cơ sở dữ liệu cho câu hỏi này
            const [existingQuestion] = await pool.execute(
                "SELECT IDNoiDung FROM noidungbaithi WHERE IDBaiThi = ?",
                [IDBaiThi]
            );
            const existingQuestionIds = existingQuestion.map(item => item.IDNoiDung);
            console.log(existingQuestionIds, 'ton tai cau hoi')

            const receivedQuestionIds = DSCauHoiArray.map(item => item.IDNoiDung);
            console.log(receivedQuestionIds, 'gan vao cau hoi')

            // Xóa câu hỏi không có trong dữ liệu gửi lên
            const idsToDeleteQ = existingQuestionIds.filter(id => !receivedQuestionIds.includes(id));
            if (idsToDeleteQ.length > 0) {
                await pool.execute(
                    `DELETE FROM dapan WHERE IDNoiDung IN (${idsToDeleteQ.map(() => '?').join(',')})`,
                    idsToDeleteQ
                );
                await pool.execute(
                    `DELETE FROM noidungbaithi WHERE IDNoiDung IN (${idsToDeleteQ.map(() => '?').join(',')})`,
                    idsToDeleteQ
                );
            }


            const existingQuestionIds1 = existingQuestion.map(item => item.IDNoiDung);

            for (const item of DSCauHoiArray) {
                const { IDNoiDung, CauHoi, AnhCauHoi, CauTraLoi } = item;

                let newImagePath = null;

                const uploadedFile = req.files.find(file => file.fieldname === `AnhCauHoi-${IDNoiDung}`);
                console.log(uploadedFile, 'uploadedFile')

                if (uploadedFile) {
                    newImagePath = uploadedFile.filename;
                }
                 else if (item.AnhCauHoi === '') {
                    // Nếu không có ảnh và AnhCauHoi là null, xóa ảnh trong database
                    await pool.execute(
                        "UPDATE noidungbaithi SET AnhCauHoi = '' WHERE IDNoiDung = ?",
                        [IDNoiDung]
                    );
                }

                console.log(CauTraLoi, 'cautraloi')
                // Cập nhật và thêm mới các câu hỏi
                if (IDNoiDung && existingQuestionIds1.includes(IDNoiDung)) {
                    await pool.execute(
                        "UPDATE noidungbaithi SET CauHoi = ?, AnhCauHoi = COALESCE(?, AnhCauHoi) WHERE IDNoiDung = ? and IDBaiThi = ?",
                        [CauHoi, newImagePath, IDNoiDung, IDBaiThi]
                    );
                } else {
                    const uploadedFileNew = req.files.find(file => file.fieldname === `AnhCauHoi-${IDNoiDung}`);
                    console.log(uploadedFileNew, 'uploadedFile')
                    const fileName = uploadedFileNew ? uploadedFileNew.filename : '';
                    console.log(fileName, 'fileName')


                    await pool.execute(
                        "insert into noidungbaithi(IDNoiDung, IDBaiThi, CauHoi, AnhCauHoi) values (?, ?, ?, ?)",
                        [IDNoiDung, IDBaiThi, CauHoi, fileName]
                    );

                    for (const answer of CauTraLoi) {
                        const { IDDapAn, DapAn, Dung } = answer;


                        const answerImageFile = req.files.find(
                            file => file.fieldname === `AnhCauTraLoi-${IDDapAn}`
                        );
                        const answerFileName = answerImageFile ? answerImageFile.filename : "";

                        await pool.execute(
                            "insert into dapan(IDDapAn, IDNoiDung, DapAn, Dung, AnhCauTraLoi) values (?, ?, ?, ?, ?)",
                            [IDDapAn, IDNoiDung, DapAn, Dung, answerFileName]
                        );
                    }
                }

                // Lấy tất cả IDDapAn hiện có trong cơ sở dữ liệu cho câu hỏi này
                const [existingAnswers] = await pool.execute(
                    "SELECT IDDapAn FROM dapan WHERE IDNoiDung = ?",
                    [IDNoiDung]
                );
                const existingAnswerIds = existingAnswers.map(answer => answer.IDDapAn);
                console.log(existingAnswerIds, 'ton tai')

                const receivedAnswerIds = CauTraLoi.map(answer => answer.IDDapAn);
                console.log(receivedAnswerIds, 'gan vao cau tra lời')

                // Xóa câu trả lời không có trong dữ liệu gửi lên
                const idsToDelete = existingAnswerIds.filter(id => !receivedAnswerIds.includes(id));
                if (idsToDelete.length > 0) {
                    await pool.execute(
                        `DELETE FROM dapan WHERE IDDapAn IN (${idsToDelete.map(() => '?').join(',')})`,
                        idsToDelete
                    );
                }
                const existingAnswerId1 = existingAnswers.map(answer => answer.IDDapAn);

                // Cập nhật và thêm mới các câu trả lời
                for (const answer of CauTraLoi) {
                    const { IDDapAn, DapAn, Dung, AnhCauTraLoi } = answer;
                    console.log(IDDapAn, 'IDDapAn')

                    const answerImageFile = req.files.find(
                        file => file.fieldname === `AnhCauTraLoi-${IDDapAn}`
                    );
                    const answerFileName = answerImageFile ? answerImageFile.filename : null;
                    console.log(answerFileName, 'answerFileName có ảnh')

                    if (answer.AnhCauTraLoi === '') {
                        // Nếu không có ảnh và AnhCauHoi là null, xóa ảnh trong database
                        await pool.execute(
                            "UPDATE dapan SET AnhCauTraLoi = '' WHERE IDDapAn = ?",
                            [IDDapAn]
                        );
                    }

                    if (IDDapAn && existingAnswerId1.includes(IDDapAn)) {
                        // Cập nhật câu trả lời hiện có
                        await pool.execute(
                            "UPDATE dapan SET DapAn = ?, Dung = ?, AnhCauTraLoi = COALESCE(?, AnhCauTraLoi) WHERE IDDapAn = ? AND IDNoiDung = ?",
                            [DapAn, Dung, answerFileName, IDDapAn, IDNoiDung]
                        );
                    } else {
                        // Thêm câu trả lời mới
                        await pool.execute(
                            "INSERT INTO dapan (IDDapAn, DapAn, Dung, IDNoiDung, AnhCauTraLoi) VALUES (?, ?, ?, ?, ?)",
                            [IDDapAn, DapAn, Dung, IDNoiDung, answerFileName]
                        );
                    }
                }
            }

            res.status(200).json({
                success: true,
                message: "Cập nhật bài thi thành công!",
            });

        } catch (error) {
            console.error("Cập nhật bài thi thất bại:", error);
            res.status(500).json({
                success: false,
                message: "Có lỗi xảy ra khi cập nhật bài thi"
            });
        }
    }
);

route.post("/deleteAnswer/:IDDapAn/:IDNoiDung", APIController.deleteAnswer);
route.post("/deleteQuestion/:IDNoiDung", APIController.deleteQuestion);


module.exports = route;
