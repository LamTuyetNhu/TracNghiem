import { img, LayDSQuiz } from "../../services/apiUser";
import { useEffect, useState } from "react";
import ModalBaiThi from "./ModalBaiThi";
import imageDefault from "../../assets/images/anh2.jpg";

const TimKiem = (props) => {
  const [arrQuiz, setArrQuiz] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getQuiz(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getQuiz = async (search = "") => {
    try {
      const response = await LayDSQuiz(search);
      setArrQuiz(response.data.dataBT);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
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
            <div className="search-page-actionable">
              <div className="search-page-items">
                <div className="search-page-input-wrapper">
                  <div className="search-page-input-container">
                    <input
                      className="search-page-input"
                      type="text"
                      placeholder="Tìm tên bài thi"
                      value={searchTerm}
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
                      <span>Bài thi có liên quan</span>
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

      {showModal && (
        <ModalBaiThi quiz={selectedQuiz} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default TimKiem;
