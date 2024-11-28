import React, { useState, useEffect, useContext } from "react";
import Select from "react-select";
import "../../../../assets/scss/Question.scss";
import "../../../../assets/scss/Manage.scss";
import { TitleContext } from "../../Content/Header/TitleContent";
import { BsFillPatchPlusFill, BsFillPatchMinusFill } from "react-icons/bs";
import { FaSquarePlus, FaSquareMinus, FaRegFileImage } from "react-icons/fa6";
import { RiImageAddLine } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import { port } from "../../../../configs/config";
// import Lightbox from "react-awesome-lightbox";
import {
  GetOneQuiz,
  img,
  DeleteAnswer,
  DeleteQuestion,
} from "../../../../services/apiService";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Questions = (props) => {
  const params = useParams();
  const IDBaiThi = params.IDBaiThi;

  const { setTitle } = useContext(TitleContext);
  const [isPreview, setPreview] = useState(false);
  const [errorInputs, setErrorInputs] = useState([]);

  const [dataImage, setDataImage] = useState({
    title: "",
    url: "",
  });
  const initQuestions = [
    {
      IDNoiDung: uuidv4(),
      CauHoi: "",
      imageFile: "",
      imageFile1: "",
      AnhCauHoi: "",
      CauTraLoi: [
        {
          IDDapAn: uuidv4(),
          DapAn: "",
          Dung: false,
        },
      ],
    }
  ]
  const [questions, setQuestions] = useState(initQuestions);

  useEffect(() => {
    getOneQuiz();
    setTitle("Quản lý câu hỏi");
  }, [setTitle]);

  const getOneQuiz = async () => {
    try {
      const response = await GetOneQuiz(IDBaiThi);
      console.log("jfhaefho: ", response.data.dataBT);
      if (response.status === 200) {
        toast.success(response.data.message);
        setQuestions(response.data.dataBT);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lấy dữ liệu không thành công!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      IDNoiDung: uuidv4(),
      CauHoi: "",
      imageFile: "",
      imageFile1: "",
      AnhCauHoi: "",
      CauTraLoi: [
        {
          IDDapAn: uuidv4(),
          DapAn: "",
          Dung: false,
        },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (idQ, value) => {
    let questionClone = _.cloneDeep(questions);
    let index = questionClone.findIndex((item) => item.IDNoiDung === idQ);
    if (index > -1) {
      questionClone[index].CauHoi = value;
      setQuestions(questionClone);

      if (!value && !errorInputs.includes(idQ)) {
        setErrorInputs([...errorInputs, idQ]);
      } else if (value && errorInputs.includes(idQ)) {
        setErrorInputs(errorInputs.filter((errorId) => errorId !== idQ));
      }
    }
  };

  const handleChangeFileQuestion = (idQ, event) => {
    let questionClone = _.cloneDeep(questions);
    let index = questionClone.findIndex((item) => item.IDNoiDung === idQ);
    if (
      index > -1 &&
      event.target &&
      event.target.files &&
      event.target.files[0]
    ) {
      // questionClone[index].imageFile = event.target.files[0];
      // console.log("...file", event.target.files[0]);
      // questionClone[index].AnhCauHoi = event.target.files[0].name;
      // console.log("...file name", event.target.files[0].name);
      // setQuestions(questionClone);
      questionClone[index].imageFile = event.target.files[0];
      questionClone[index].imageFile1 = URL.createObjectURL(
        event.target.files[0]
      );
      questionClone[index].AnhCauHoi = event.target.files[0].name;
      setQuestions(questionClone);
    }
  };

  const handleSubmit = async () => {
    // isValidate Question
    let isValidQuestion = true;
    let indexQuestion = 0;
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].CauHoi) {
        isValidQuestion = false;
        indexQuestion = i;
        break;
      }
    }

    if (isValidQuestion === false) {
      toast.error(`Câu trả lời thứ ${indexQuestion + 1} đang rỗng!`);
      return;
    }

    //Validate Answer
    let isValidAnswer = true;

    let indexQ = 0,
      indexA = 0;
    for (let i = 0; i < questions.length; i++) {
      for (let j = 0; j < questions[i].CauTraLoi.length; j++) {
        if (!questions[i].CauTraLoi[j].DapAn) {
          isValidAnswer = false;
          indexA = j;
          break;
        }
      }
      indexQ = i;
      if (isValidAnswer === false) {
        break;
      }
    }

    if (isValidAnswer === false) {
      toast.error(
        `Câu trả lời thứ ${indexA + 1} của câu hỏi ${indexQ + 1} đang rỗng!`
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("IDBaiThi", IDBaiThi);
      formData.append("DSCauHoi", JSON.stringify(questions));

      questions.forEach((question, index) => {
        if (question.imageFile) {
          formData.append(
            `AnhCauHoi-${question.IDNoiDung}`,
            question.imageFile,
            question.imageFile.name
          );
        }
      });

      let response = await axios.post(
        `${port}/api/admin/addQuestions/${IDBaiThi}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Thêm câu hỏi thành công");
      getOneQuiz()
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm câu hỏi");
      console.error("Error adding questions:", error);
    }
  };

  const handlePreviewImage = (idQ) => {
    let questionClone = _.cloneDeep(questions);
    let index = questionClone.findIndex((item) => item.IDNoiDung === idQ);
    if (index > -1) {
      setDataImage({
        // url: img + questionClone[index].AnhCauHoi, // Ensure img is defined
        url:
          questionClone[index].imageFile1 ||
          img + questionClone[index].AnhCauHoi,
        title: questionClone[index].AnhCauHoi,
      });
      setPreview(true);
    }
  };

  const handleDeleteAnswer = async (idQ, idA) => {
    try {
      let response = await DeleteAnswer(idA, idQ); // Gọi API xóa câu trả lời
      if (response.status === 200) {
        toast.success(response.data.message);
        let questionClone = _.cloneDeep(questions);
        let questionIndex = questionClone.findIndex(
          (item) => item.IDNoiDung === idQ
        );
        if (questionIndex > -1) {
          questionClone[questionIndex].CauTraLoi = questionClone[
            questionIndex
          ].CauTraLoi.filter((answer) => answer.IDDapAn !== idA);
          setQuestions(questionClone);
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa câu trả lời");
      console.error("Error deleting answer:", error);
    }
  };

  const handleDeleteQuestion = async (idQ) => {
    try {
      let response = await DeleteQuestion(idQ); // Gọi API xóa câu hỏi
      if (response.status === 200) {
        toast.success(response.data.message);
        let updatedQuestions = questions.filter(
          (question) => question.IDNoiDung !== idQ
        );
        setQuestions(updatedQuestions);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa câu hỏi");
      console.error("Error deleting question:", error);
    }
  };

  return (
    <>
      <div className="questions-container">
        <div className="add-new-question">
          {questions.length === 0 && (
            <div className="add-question-placeholder">
              <span onClick={handleAddQuestion} className="users-content__btn ">
                <span>Tạo câu hỏi</span>
                <BsFillPatchPlusFill className="icon-addQues" />
              </span>
            </div>
          )}

          {questions.map((question, index) => (
            <div key={question.IDNoiDung}>
              <div className="row questions-content">
                <div className="mb-3 col-8">
                  <label className="form-label">Câu hỏi {index + 1}</label>
                  <input
                    type="text"
                    className={`form-control ${errorInputs.includes(question.IDNoiDung) ? 'error' : ''}`}
                    placeholder="Nhập câu hỏi"
                    value={question.CauHoi}
                    onChange={(e) =>
                      handleQuestionChange(question.IDNoiDung, e.target.value)
                    }
                  />
                </div>

                <div className="col-3">
                  <label className="form-label">Chọn ảnh</label>
                  <div className="group-upload">
                    <label htmlFor={`${question.IDNoiDung}`}>
                      <RiImageAddLine className="icon" />
                    </label>

                    <input
                      id={`${question.IDNoiDung}`}
                      type="file"
                      onChange={(event) =>
                        handleChangeFileQuestion(question.IDNoiDung, event)
                      }
                      hidden
                    />
                    <span>
                      {question.AnhCauHoi ? (
                        <span
                          onClick={() => handlePreviewImage(question.IDNoiDung)}
                          style={{ cursor: "pointer" }}
                        >
                          {question.AnhCauHoi}
                        </span>
                      ) : (
                        "Chưa chọn ảnh"
                      )}
                    </span>
                  </div>
                </div>

                <div className="form-item col-1 users-content__btn">
                  <span onClick={handleAddQuestion}>
                    <BsFillPatchPlusFill className="icon-addQues" />
                  </span>
                  {questions.length > 1 && (
                    <span
                      onClick={() => handleDeleteQuestion(question.IDNoiDung)}
                    >
                      <BsFillPatchMinusFill className="icon-minusQues" />
                    </span>
                  )}
                </div>
              </div>

              {question.CauTraLoi &&
                question.CauTraLoi.length > 0 &&
                question.CauTraLoi.map((answer, index) => (
                  <div key={answer.IDDapAn} className="answers-content">
                    <div className="answers-checkbox">
                      <label></label>
                      <input
                        // className="mb-3 form-check-input iscorrect"
                        className={`form-control mb-3 iscorrect form-check-input iscorrect ${errorInputs.includes(question.CauTraLoi.IDDapAn) ? 'error' : ''}`}
                        type="checkbox"
                        checked={answer.Dung}
                        onChange={(event) =>
                          setQuestions(
                            questions.map((q) => {
                              if (q.IDNoiDung === question.IDNoiDung) {
                                return {
                                  ...q,
                                  CauTraLoi: q.CauTraLoi.map((a) =>
                                    a.IDDapAn === answer.IDDapAn
                                      ? { ...a, Dung: event.target.checked }
                                      : a
                                  ),
                                };
                              }
                              return q;
                            })
                          )
                        }
                      />
                    </div>
                    <div className="col-7 answer-name">
                      <label className="form-label">Trả lời {index + 1}</label>
                      <input
                        type="text"
                        value={answer.DapAn}
                        className="form-control"
                        placeholder="Nhập câu trả lời"
                        onChange={(event) =>
                          setQuestions(
                            questions.map((q) => {
                              if (q.IDNoiDung === question.IDNoiDung) {
                                return {
                                  ...q,
                                  CauTraLoi: q.CauTraLoi.map((a) =>
                                    a.IDDapAn === answer.IDDapAn
                                      ? { ...a, DapAn: event.target.value }
                                      : a
                                  ),
                                };
                              }
                              return q;
                            })
                          )
                        }
                      />
                    </div>
                    <div className="form-item users-content__btn">
                      <span
                        onClick={() =>
                          setQuestions(
                            questions.map((q) => {
                              if (q.IDNoiDung === question.IDNoiDung) {
                                return {
                                  ...q,
                                  CauTraLoi: [
                                    ...q.CauTraLoi,
                                    {
                                      IDDapAn: uuidv4(),
                                      DapAn: "",
                                      Dung: false,
                                    },
                                  ],
                                };
                              }
                              return q;
                            })
                          )
                        }
                      >
                        <FaSquarePlus className="icon-addQues" />
                      </span>
                      {question.CauTraLoi.length > 1 && (
                        <span
                          onClick={() =>
                            handleDeleteAnswer(
                              question.IDNoiDung,
                              answer.IDDapAn
                            )
                          }
                        >
                          <FaSquareMinus className="icon-minusQues" />
                        </span>
                      )}
                    </div>
                    <div className="space-input"></div>
                  </div>
                ))}
              <div className="space-input"></div>
            </div>
          ))}

          <div className="footer">
            <button className="footer-icon submit-btn" onClick={handleSubmit}>
              Lưu thông tin
            </button>
          </div>

          {/* {isPreview && (
            <Lightbox
              image={dataImage.url}
              title={dataImage.title}
              onClose={() => setPreview(false)}
            />
          )} */}
        </div>
      </div>
    </>
  );
};

export default Questions;
