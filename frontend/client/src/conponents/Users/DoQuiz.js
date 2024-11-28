import { useEffect, useState } from "react";
import {
  img,
  GetOneQuiz,
  NopBai,
  KetQuaThi,
  port,
} from "../../services/apiUser";
import "../../assets/scss/ListQuiz.scss";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../../assets/scss/DoQuiz.scss";
import { CiClock1 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { io } from "socket.io-client";

// const socket = io("http://localhost:8080");
const socket = io(port);

const DoQuiz = () => {
  const navigate = useNavigate();
  const params = useParams();

  const IDBaiThi = params.IDBaiThi;
  const PassCode = params.PassCode;

  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");

  const [arrQuiz, setArrQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const [TgThi, setTgThi] = useState("");
  const [startTime] = useState(Date.now());

  const colors = ["teal-box", "orange-box", "pink-box", "purple-box"];

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Thêm số 0 ở phía trước nếu cần
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  };
  // Kết nối socket khi trang được load
  useEffect(() => {
    getOneQuiz();
    socket.emit("joinWaitingRoom", { IDBaiThi, IDUser });
  }, [IDBaiThi, IDUser, token, PassCode]);

  const getOneQuiz = async () => {
    try {
      const response = await GetOneQuiz(IDBaiThi, PassCode, token);
      if (response.status === 200) {
        // toast.success(response.data.message);
        setArrQuiz(response.data.dataBT);
        setTgThi(response.data.TgThi);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch quiz data!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const handleAnswerSelect = (IDNoiDung, IDDapAn) => {
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = {
        ...prevAnswers,
        [IDNoiDung]: IDDapAn,
      };
      return updatedAnswers;
    });
  };

  // Effect để xử lý việc chuyển câu hỏi và nộp bài
  useEffect(() => {
    if (userAnswers[arrQuiz[currentQuestionIndex]?.IDNoiDung] !== undefined) {
      if (currentQuestionIndex < arrQuiz.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        submitQuiz(); // Nộp bài khi câu hỏi cuối cùng đã được trả lời
      }
    }
  }, [userAnswers, currentQuestionIndex, arrQuiz]);

  const submitQuiz = async () => {
    // Tạo một bản sao của userAnswers để đảm bảo không thay đổi trực tiếp
    const completedAnswers = { ...userAnswers };

    // Duyệt qua tất cả câu hỏi để đảm bảo mỗi câu đều có một đáp án (rỗng nếu chưa được chọn)
    arrQuiz.forEach((question) => {
      if (!completedAnswers[question.IDNoiDung]) {
        completedAnswers[question.IDNoiDung] = ""; // Đặt IDDapAn là rỗng nếu câu hỏi chưa có đáp án
      }
    });

    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    const dataToSubmit = {
      userAnswers: completedAnswers,
      totalTimeSpent,
    };

    try {
      const response = await NopBai(
        IDUser,
        IDBaiThi,
        PassCode,
        token,
        dataToSubmit
      );
      if (response.status === 200) {
        const TgNopBai = response.data.TgNopBai;
        const response1 = await KetQuaThi(
          IDBaiThi,
          IDUser,
          PassCode,
          TgNopBai,
          token
        );
        console.log(response1, "response1");
       
        if (response1.status === 200) {
          const userResults = {
            name: response1.data.ThongTin[0].NameUser,
            email: response1.data.ThongTin[0].EmailUser,
            score: response1.data.dataDiemThi[0].TongDiem,
            tgthuchien: response1.data.dataDiemThi[0].TgThucHien,
            tgnop: TgNopBai,
            IDUser,
          };

          console.log("Emitting userSubmittedQuiz:", userResults);

          socket.emit("userSubmittedQuiz", {
            IDBaiThi,
            IDUser,
            userResults,
          });
        }
        navigate(`/Result/${IDBaiThi}/${PassCode}`);
        localStorage.setItem("TgNopBai", TgNopBai);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to submit quiz!");
      console.error("Error submitting quiz:", error);
    }
  };

  // Timer functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setTgThi((prev) => {
        if (prev === 1) {
          if (currentQuestionIndex < arrQuiz.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            return arrQuiz[currentQuestionIndex + 1].TgThi;
          } else {
            submitQuiz();
            clearInterval(timer);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [TgThi, currentQuestionIndex]);

  useEffect(() => {
    // Reset time for new question
    if (arrQuiz.length > 0) {
      setTgThi(arrQuiz[currentQuestionIndex].TgThi);
    }
  }, [currentQuestionIndex, arrQuiz]);

  return (
    <>
      <div className="w-full h-full">
        <div className="root-component">
          <div className="app-header-container">
            <button className="btn-time">
              <CiClock1 /> {formatTime(TgThi)}
            </button>
            <button className="btn-close" onClick={() => navigate("/")}>
              <IoMdClose className="btn-close__icon" />
            </button>
          </div>

          {arrQuiz.length > 0 && (
            <div className="question_all">
              <div className="question-theme p-4 quiz-container w-full h-full">
                <div className="quiz-container-inner">
                  <div className="">
                    <div className="box-border">
                      <div className="pill">
                        <p className="pill-counter">
                          <span>{currentQuestionIndex + 1}</span>/
                          <span>{arrQuiz.length}</span>
                        </p>
                      </div>
                      <div className="row w-full h-full question">
                        {arrQuiz[currentQuestionIndex].AnhCauHoi && (
                          <div className="col col-12 col-md-4 question-img">
                            <img
                              src={
                                img + arrQuiz[currentQuestionIndex].AnhCauHoi
                              }
                              alt="Question image"
                              className="question-image w-full h-full object-contain rounded md:rounded-lg bg-ds-dark-500-50 cursor-pointer"
                            />
                          </div>
                        )}
                        <div
                          className={`col ${
                            arrQuiz[currentQuestionIndex].AnhCauHoi
                              ? "col-12 col-md-8"
                              : "col-12"
                          } question-content`}
                        >
                          {/* <p>{arrQuiz[currentQuestionIndex].CauHoi}</p> */}
                          <p dangerouslySetInnerHTML={{ __html: arrQuiz[currentQuestionIndex].CauHoi }}></p>

                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mg_option">
                    <div className="row options-container">
                      {arrQuiz[currentQuestionIndex].CauTraLoi.map(
                        (answer, indexA) => (
                          <div
                            key={indexA}
                            className={`col col-6 col-md-3 custom-box ${
                              colors[indexA % colors.length]
                            }`}
                            onClick={() =>
                              handleAnswerSelect(
                                arrQuiz[currentQuestionIndex].IDNoiDung,
                                answer.IDDapAn
                              )
                            }
                          >
                            <div className="custom-noneFlex">

                            {answer.DapAn && <>{answer.DapAn}</>}
                            {answer.AnhCauTraLoi && (
                              <>
                                <img
                                className="custom-img"
                                  src={img + answer.AnhCauTraLoi}
                                  alt="Answer"
                                />
                              </>
                            )}
                              </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <br />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DoQuiz;
