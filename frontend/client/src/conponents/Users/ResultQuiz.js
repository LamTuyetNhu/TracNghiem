import { useEffect, useState } from "react";
import { img, GetOneQuiz, KetQuaThi, port } from "../../services/apiUser";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { CiClock1 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import anh from "../../assets/images/mythuat.jpg";
import "../../assets/scss/ResultQuiz.scss";
import io from "socket.io-client";
// const socket = io("http://localhost:8080");
const socket = io(port);

const ResultQuiz = () => {
  const navigate = useNavigate();
  const params = useParams();

  const IDBaiThi = params.IDBaiThi;
  const PassCode = params.PassCode;
  // const TgNopBai = params.TgNopBai;

  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");
  const [arrQuiz, setArrQuiz] = useState([]);
  const [diem, setDiem] = useState("");

  const [DiemThi, setDiemThi] = useState([]);
  const [CauTraLoi, setCauTraLoi] = useState([]);
  const TgNopBai = localStorage.getItem("TgNopBai");

  useEffect(() => {
    getOneQuiz();
    ketQuaThi();
    // Tham gia phòng chờ của bài thi
    socket.emit("joinWaitingRoom", { IDBaiThi, IDUser });

    return () => {
      // Gửi yêu cầu rời phòng trước khi ngắt kết nối
      socket.disconnect();
      // socket.emit('leaveRoom', { IDBaiThi, IDUser }, () => {
      //   console.log('Socket disconnected ng dùng', IDUser);
      // });
    };
  }, [IDUser, token, IDBaiThi, PassCode]);

  const getOneQuiz = async () => {
    try {
      const response = await GetOneQuiz(IDBaiThi, PassCode, token);
      if (response.status === 200) {
        setArrQuiz(response.data.dataBT);
        setDiem(response.data.Diem);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch quiz data!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const ketQuaThi = async () => {
    try {
      const response = await KetQuaThi(
        IDBaiThi,
        IDUser,
        PassCode,
        TgNopBai,
        token
      );
      console.log(response.data);
      if (response.status === 200) {
        setDiemThi(response.data.dataDiemThi[0]);
        setCauTraLoi(response.data.dataCTL);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch quiz data!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Thêm số 0 ở phía trước nếu cần
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const handleClose = () => {
    console.log("chạy");
    socket.emit("leaveRoom", { IDBaiThi, IDUser }, () => {
      console.log("thoát");
    });
    navigate("/");
  };

  return (
    <>
      <div className="w-full h-full ">
        <div className="root-component">
          <div className="app-header-container-result">
            {/* <button className="btn-close" onClick={() => navigate("/")}>
              <IoMdClose className="btn-close__icon" />
            </button> */}

            <button className="btn-close" onClick={handleClose}>
              <IoMdClose className="btn-close__icon" />
            </button>
          </div>

          <div className="min-height">
            <div className="themed screen-container">
              <div className="main-section-title">
                <p className="font-medium ">KẾT QUẢ</p>
              </div>

              <div className="accuracy-info-second-row flex-view">
                {/* <div className="top-section info-container ">
                  <div className="value-and-title-container flex-view flex-col">
                    <span className="info-title font-medium text-xs text-ds-light-300">
                      Số câu đúng
                    </span>
                    <span className="player-rank">
                      {(DiemThi.TongDiem * 1.0) / diem}
                    </span>
                  </div>
                </div>
                <div className="space"></div> */}

                <div className="top-section info-container flex-view">
                  <div className="value-and-title-container flex-view flex-col">
                    <span className="info-title font-medium text-xs text-ds-light-300">
                      Điểm của bạn
                    </span>
                    <span className="player-score">{DiemThi.TongDiem}</span>
                  </div>
                </div>
              </div>

              {/* <div className="actions-container">
                <button type="button" className="primary-action-btn">
                  Thực hiện lại
                </button>
              </div> */}

              <div className="animated fadeInUp anim-400-duration middle-section-wrapper">
                <div className="middle-section">
                  <div className="title">Số liệu thống kê hiệu suất</div>
                  <div className="stats-container num-5">
                    <div className="stat-box-big correct-container">
                      <div className="bg-image bg-image-true"></div>
                      <div className="value">
                        {(DiemThi.TongDiem * 1.0) / diem}
                      </div>
                      <div className="label">Câu đúng</div>
                    </div>
                    <div className="stat-box-big incorrect-container">
                      <div className="bg-image bg-image-false"></div>
                      <div className="value">
                        {arrQuiz.length - (DiemThi.TongDiem * 1.0) / diem}
                      </div>
                      <div className="label">Sai</div>
                    </div>
                    <div className="stat-box-big avg-time-container">
                      <div className="bg-image bg-image-time"></div>
                      <div className="value">
                        {" "}
                        {formatTime(DiemThi.TgThucHien)}
                      </div>
                      <div className="label">Thời gian</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="review-section">
                <div className="header-container">
                  <div className="header-desc">
                    <div className="title">Xem lại Câu hỏi</div>
                  </div>
                </div>

                <div className="question-review-list">
                  <div className="review-container">
                    {arrQuiz &&
                      arrQuiz.length > 0 &&
                      arrQuiz.map((item, index) => {
                        // Kiểm tra nếu câu hỏi này có bất kỳ câu trả lời sai nào
                        const isIncorrect = CauTraLoi.some(
                          (ctl) =>
                            ctl.IDNoiDung === item.IDNoiDung &&
                            ctl.DungSai === 0
                        );

                        return (
                          <button
                            type="button"
                            className={`question-container ${
                              isIncorrect ? "question-incorrect" : ""
                            }`}
                          >
                            <div className="question-info-container ">
                              {item.AnhCauHoi && (
                                <img
                                  src={img + item.AnhCauHoi}
                                  className="question-image bg-no-repeat bg-center bg-contain"
                                />
                              )}
                              <div className="question-text-wrapper">
                                <div className="question-text text-ds-black-500">
                                  
                                  <span dangerouslySetInnerHTML={{ __html: item.CauHoi }}></span>
                                  
                                </div>
                              </div>
                            </div>
                            <div className="options-container1">
                              {item.CauTraLoi.map((answer, indexA) => {
                                const userAnswer = CauTraLoi.find(
                                  (ctl) =>
                                    ctl.IDNoiDung === item.IDNoiDung &&
                                    ctl.DapAn === answer.IDDapAn
                                );

                                // Define correct and incorrect classes based on conditions
                                const correctClass =
                                  answer.Dung === 1 ? "option-correct" : "";
                                const incorrectClass =
                                  userAnswer && userAnswer.DungSai === 0
                                    ? "option-incorrect"
                                    : "";

                                return (
                                  <div
                                    key={indexA}
                                    className={`option-container full-width ${correctClass} ${incorrectClass}`}
                                  >
                                    <input
                                      type="radio"
                                      className="bullet"
                                      checked={answer.Dung === 1} // Đánh dấu đáp án của người dùng
                                      readOnly // Đảm bảo radio không thể chỉnh sửa
                                    />

                                    <span className="option-text text-ds-black-500">
                                      {answer.DapAn && <>{answer.DapAn}</>}

                                      {answer.AnhCauTraLoi && (
                                        <>
                                          <img
                                          className="option-img"
                                            src={img + answer.AnhCauTraLoi}
                                            alt="Answer"
                                          />
                                        </>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultQuiz;
