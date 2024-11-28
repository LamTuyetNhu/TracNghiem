import React from "react";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { img } from "../../services/apiUser";
import { useSelector } from "react-redux";
import imageDefault from "../../assets/images/anh2.jpg"
import avt from "../../assets/images/avatar.jpg"

const ModalBaiThi = ({ quiz, onClose }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

  const handleQuizClick = (IDBaiThi, PassCode) => {
    if (isAuthenticated === true) {
      navigate(`/DoQuiz/${IDBaiThi}/${PassCode}`);
    } else {
      navigate(`/Login`);
    }
  }

  return (
    <>
      <div className=" modal-container" data-cy="modal-container">
        <div className=" modal-mask-container">
          <div className=" modal-mask" data-testid="modal-mask"></div>
          <div tabindex="0" className=" modal-body">
            <div
              className=" quiz-info-wrapper"
              data-cy="quiz-info-wrapper"
              callsinprogress=""
            >
              <div
                className=" quiz-info-container"
                tabindex="0"
                role="dialog"
                aria-modal="true"
                aria-label="Quiz info"
              >
                <div className=" top-btns-bar flex-view">
                  {/* <div className=" flex-view share-btn-container">
                    <div
                      className=" text share-link bold-text"
                    >
                      <input
                        id="quiz-info-share-input"
                        type="text"
                        data-cy="quiz-info-share-input"
                        className=" text bold-text share-link-input"
                        spellcheck="off"
                        autocomplete="off"
                      />
                    </div>
                  </div> */}
                  <button
                    type="button"
                    className=" top-btn close-btn select-none strip-default-btn-style"
                    aria-label="Close quiz info dialog"
                    data-cy="close-btn"
                    onClick={onClose}
                  >
                    <IoMdClose />
                  </button>
                </div>
                <div className=" quiz-background">
                  <div className=" curved-edge-container media-dimensions media-wrapper">
                    <div className=" curve">
                      <div className=" content-container">
                        <img
                        src={(quiz?.AnhBaiThi) ? (img + quiz?.AnhBaiThi) : imageDefault}
                          className=" content-container-avatar"
                          alt="Avatar"
                        />
                      </div>
                    </div>
                  </div>
                  {/* <div className=" quiz-stats">
                    <span
                      className=" questions-length"
                      data-cy="questions-length"
                    >
                      8 questions
                    </span>
                    <span className="times-played">55k plays</span>
                  </div> */}
                </div>
                <div className=" quiz-info">
                  <div className=" quiz-name" data-cy="quiz-name">
                    {quiz?.TenBaiThi}
                  </div>
                  <div className=" user-and-grade-info">
                    <div className=" user-info">
                      <img
                        src={avt}
                        className=" user-avatar"
                        alt="Avatar"
                      />
                      <span className=" username">{quiz?.NameUser}</span>
                    </div>
                    <div className=" grade-info">
                      {/* <span className=" grade-label">Grades:</span>
                      <span className=" grade-range">K to 14th</span> */}
                    </div>
                  </div>
                  <div className=" user-grade-info-separator"></div>
                </div>
                <div className=" start-quiz">
                  <button
                    type="button"
                    className=" play-quiz-btn strip-default-btn-style"
                    aria-label="Practice"
                    data-cy="play-quiz-btn"
                    onClick={() => handleQuizClick(quiz?.IDBaiThi, quiz?.PassCode)}
                  >
                    <span className=" btn-label">Practice</span>
                    <i className=" btn-icon icon-fas-play"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalBaiThi;
