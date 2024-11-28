import axios from "../utils/axiosUser";
import { port } from "../configs/config";

const img = `${port}/images/`
const url = `${port}/api/user/`

const LoginUser = (email, password) => {
  return axios.post(`api/user/login`, {email: email, password: password, delay: 3000});
};

const RegisterUser = (name, email, password) => {
  return axios.post(`api/user/register`, {name, email, password});
};

const UserInfo = (IDUser, token) => {
  return axios.get(`/api/user/LayMotUser/${IDUser}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const CapNhapUser = (IDUser, userdata, token) => {
  return axios.post(`/api/user/CapNhapUser/${IDUser}`, userdata, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const DoiMatKhau = (IDUser, userdata, token) => {
  return axios.post(`/api/user/DoiMatKhau/${IDUser}`, userdata, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const LayDSQuizMotUser = (IDUser, token) => {
  console.log('Token being sent:', `Bearer ${token}`);
  return axios.get(`/api/user/LayDanhSachBaiThiMotUser/${IDUser}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const LayDSQuiz = () => {
  return axios.get(`/api/user/LayDanhSachTatCaBaiThi`);
}

const DaDangKy = (IDUser, IDBaiThi, token) => {
  console.log("SFSO: ", IDUser, IDBaiThi, token)
  return axios.get(`/api/user/KiemTraDaDangKy/${IDUser}/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const DangKy = (IDUser, IDBaiThi, token) => {
  return axios.post(`/api/user/DangKy/${IDUser}/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const HuyDangKy = (IDUser, IDBaiThi, token) => {
  return axios.post(`/api/user/HuyDangKy/${IDUser}/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const DSKetQuaLanThi = (IDUser, IDBaiThi, token) => {
  console.log("SFSO: ", IDUser, IDBaiThi, token)
  return axios.get(`/api/user/KetQuaThi/${IDUser}/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const GetOneQuiz = (IDBaiThi, token) => {
  return axios.get(`/api/user/LayMotBaiThi/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const NopBai = (IDUser, IDBaiThi, token, formData) => {
  return axios.post(`/api/user/NopBai/${IDUser}/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }, formData
  });
}

export {
  img,
  url,
  LayDSQuiz,
  GetOneQuiz,
  DaDangKy,
  DangKy,
  HuyDangKy,
  NopBai,
  DSKetQuaLanThi,
  LayDSQuizMotUser,
  LoginUser,
  RegisterUser,
  UserInfo,
  CapNhapUser,
  DoiMatKhau
}