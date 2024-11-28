import { useNavigate, useOutletContext } from "react-router-dom";
import { img, LayDSBaiThiDaThi } from "../../services/apiUser";
import { useEffect, useState } from "react";
import imageDefault from "../../assets/images/anh2.jpg";

const LopHoc = (props) => {
  const [arrQuiz, setArrQuiz] = useState([]);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const { searchTerm } = useOutletContext();
  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");
  const navigate = useNavigate();

  useEffect(() => {
    getQuiz(searchTerm);
  }, [searchTerm1, searchTerm, IDUser]);

  const getQuiz = async (search = "") => {
    try {
      if(searchTerm1 !== "") {
      const response = await LayDSBaiThiDaThi(searchTerm1, IDUser);
      setArrQuiz(response.data.dataBT);
      } else {
        const response = await LayDSBaiThiDaThi(search, IDUser);
        setArrQuiz(response.data.dataBT);
      }
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
    }
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    console.log("Lop hoc:", quiz);
    navigate(`/DiemBaiThi/${quiz.PassCode}`);

  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    // Thêm số 0 ở phía trước nếu cần
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  
    return `${formattedMinutes}:${formattedSeconds}`;
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm1(e.target.value);
  };

  return (
    <>
      <div className="homepage-container">
        <div className="home-container">
          <div className="content">

          <div className="search-page-actionable">
              <div className="search-page-items">
                <div className="search-page-input-wrapper">
                  <div className="search-page-input-container">
                    <input
                      className="search-page-input"
                      type="text"
                      placeholder="Tìm tên bài thi"
                      value={searchTerm1}
                      onChange={handleSearchChange}
                    />
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
                      <span>Tất cả bài thi của bạn</span>
                    </div>
                  </div>
                  <div className="featured-section-quizzzes">
                    <div className="solo-quiz-container select-none">
                      <div className="solo-quizzes">
                      {Array.isArray(arrQuiz) && arrQuiz.length > 0 ? (
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
                                          ? 
                                          img + quiz?.AnhBaiThi
                                          : imageDefault
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="quiz-info">
                                <span></span>
                                <span className="times-played">
                                  {quiz.NameUser}
                                </span>
                              </div>
                              <div className="quiz-result">
                                <p className="quiz-name">{quiz.TenBaiThi}</p>
                                {/* <span className="quiz-author">
                                  {quiz.NameUser}
                                </span> */}
                                <div className="quiz-res">
                                  <span className="">
                                    Số lần thi: {quiz.SoLanThi}
                                  </span>
                                  <span className="">
                                    Điểm cao nhất: {quiz.DiemCaoNhat}
                                  </span>
                                </div>
                              </div>
                            </button>
                          ))

                        ) : (
                          <div class="search-init flex-view all-center" data-cy="search-init"><div class="search-init-content"><img  alt="searh illustration" src="https://cf.quizizz.com/game/img/ui/search_nux.png" /><div class="search-init-text">Không tìm thấy kết quả</div></div></div>
                        )}
                      </div>
                    </div>
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

export default LopHoc;
