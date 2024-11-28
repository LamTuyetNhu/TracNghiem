import { useSelector } from "react-redux";
import { useNavigate, useOutletContext } from "react-router-dom";
import { img, LayDSQuiz, SearchByCode } from "../../services/apiUser"; // Import SearchByCode
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import ModalBaiThi from "./ModalBaiThi";
import imageDefault from "../../assets/images/anh2.jpg";
import "react-toastify/dist/ReactToastify.css";

const Home = (props) => {
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const navigate = useNavigate();
  const [arrQuiz, setArrQuiz] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [PassCode, setCode] = useState(""); // State để lưu mã nhập vào
  const { searchTerm } = useOutletContext();
  const token = localStorage.getItem("token");

  useEffect(() => {
    getQuiz(searchTerm);
  }, [searchTerm]);

  const getQuiz = async (search = "") => {
    try {
      const response = await LayDSQuiz(search);
      setArrQuiz(response.data.dataBT);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
    }
  };

  // Hàm xử lý khi nhấn Enter hoặc nhấn nút Tham gia
  const handleJoin = async () => {
    if (!PassCode) {
      toast.error("Vui lòng nhập mã!");
      return;
    }

    try {
      const response = await SearchByCode(PassCode, token); // Gọi API với mã nhập vào
      console.log(response);

      if (response.status === 200 && response.data.dataBaiThi.length > 0) {
        const IDBaiThi = response.data.dataBaiThi[0].IDBaiThi;
        navigate(`/ThongTinBaiThi/${IDBaiThi}/${PassCode}`);
      } else {
        toast.warning("Không tìm thấy bài thi!");
      }
    } catch (error) {
      toast.error("Không tìm thấy bài thi!");
      console.error("Error searching by code:", error);
    }
  };

  // Xử lý khi người dùng nhấn Enter trong ô input
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleJoin(); // Gọi hàm join khi nhấn Enter
    }
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="homepage-container">
        <div className="home-container">
          <div className="content">
            <div className="content-actionable">
              <div className="home-proceed-game-container">
                <div className="home-proceed-game">
                  <div className="flex flex-col items-center">
                    <form
                      id="proceed-game-action-wrapper"
                      className="proceed-game-action-wrapper"
                      onSubmit={(e) => e.preventDefault()} // Ngăn form reload trang
                    >
                      <div className="proceed-game-input-container relative">
                        <input
                          className="check-room-input"
                          placeholder="Tham gia bằng mã"
                          type="tel"
                          pattern="[0-9 ]*"
                          maxLength="8"
                          aria-label="Tham gia bằng mã"
                          value={PassCode}
                          onChange={(e) => setCode(e.target.value)} // Cập nhật state khi nhập mã
                          onKeyPress={handleKeyPress} // Lắng nghe sự kiện nhấn Enter
                        />
                      </div>
                      <button
                        className="greenbutton_header"
                        onClick={handleJoin} // Gọi hàm join khi nhấn nút
                      >
                        <span className="visible">Tham gia</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div className="feartured-solo-quizzes">
              <div className="quizzes-and-games-list">
                <div className="featured-quiz-recommendations">
                  <div className="featured-section-header">
                    <div className="featured-section-title select-none">
                      <img
                        alt="star"
                        src="https://cf.quizizz.com/img/icons/starboy.png"
                        className="star-icon"
                      />
                      <span>Tất cả bài thi</span>
                    </div>
                  </div>

                  <div className="featured-section-quizzzes">
                    <div className="solo-quiz-container select-none">
                      <div className="solo-quizzes">
                        {Array.isArray(arrQuiz) &&
                          arrQuiz.map((quiz, index) => (
                            <button
                              aria-label="Quiz Information Card"
                              type="button"
                              className="solo-quiz max-in-row-2 max-in-row-3 max-in-row-4 max-in-row-5"
                              onClick={() => handleQuizClick(quiz)}
                            >
                              <div className="curved-edge-container media-dimensions media-wrapper">
                                <div className="curve">
                                  <div className="content-container">
                                    <img
                                      className="media-dimensions image-loaded media object-cover"
                                      alt={quiz.TenBaiThi}
                                      src={
                                        quiz?.AnhBaiThi
                                          ? img + quiz?.AnhBaiThi
                                          : imageDefault
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="quiz-result">
                                <p className="quiz-name">{quiz.TenBaiThi}</p>
                                <span className="quiz-author">
                                Tác giả: {quiz.NameUser}
                                </span>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ModalBaiThi quiz={selectedQuiz} onClose={handleCloseModal} />
      )}
      <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
      />
    </>
  );
};

export default Home;
