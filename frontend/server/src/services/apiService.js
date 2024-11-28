import axios from "../utils/axiosUser";
import { port } from "../configs/config";

const linkUpdateQuiz = `${port}/api/admin/updateQuiz`;
const img = `${port}/images/`

const AdminCreateUser = (formData) => {
  console.log(formData)
  return axios.post("api/admin/addUser", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Authorization: `Bearer ${token}`
    },
  });
};

const GetAllUsers = (LIMIT_USER, page, search) => {
  console.log(LIMIT_USER, page, search)
  return axios.get(`api/admin/users/${LIMIT_USER}/${page}/${search}`);
};

const DeleteUser = (IDUser) => {
  return axios.post(`api/admin/user/${IDUser}`);
};

const GetAllQuiz = (LIMIT_USER, page, TTBaiThi, search) => {
  return axios.get(`api/admin/quizzes/${LIMIT_USER}/${page}/${TTBaiThi}/${search}`);
};

const DeleteQuiz = (IDBaiThi, PassCode) => {
  return axios.post(`api/admin/deleteQuiz/${IDBaiThi}/${PassCode}`);
};

const DisableQuiz = (IDBaiThi) => {
  return axios.post(`api/admin/disableQuiz/${IDBaiThi}`);
};

const GetOneQuiz = (IDBaiThi) => {
  return axios.get(`api/admin/question/${IDBaiThi}`);
};

const AddListQuestion = (IDBaiThi, idNoiDung, cauhoi, anh) => {
  const data = new FormData()
  data.append("IDNoiDung", idNoiDung)
  data.append("CauHoi", cauhoi)
  data.append("AnhCauHoi", anh)
  return axios.post(`api/admin/addQuestions/${IDBaiThi}`, data);
};

const DeleteAnswer = (IDDapAn, IDNoiDung) => {
  return axios.post(`api/admin/deleteAnswer/${IDDapAn}/${IDNoiDung}`);
};

const DeleteQuestion = (IDNoiDung) => {
  return axios.post(`api/admin/deleteQuestion/${IDNoiDung}`);
};

export {
  linkUpdateQuiz,
  img,
  port,

  AdminCreateUser,
  GetAllUsers,
  DeleteUser,

  GetAllQuiz,
  DeleteQuiz,
  DisableQuiz,

  GetOneQuiz, 
  AddListQuestion,
  DeleteAnswer,
  DeleteQuestion
}