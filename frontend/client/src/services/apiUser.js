import axios from "../utils/axiosUser";
import { port } from "../configs/config";
// const port = `http://192.168.2.9:8080`

const url = `${port}/api/user/`;
const img = `${port}/images/`

const LoginUser = (email, password) => {
  return axios.post(`api/user/login`, {email: email, password: password});
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

const LayDSQuiz = (search = "") => {
  return axios.get(`/api/user/LayDanhSachTatCaBaiThi`, {
    params: { search }, // Pass search as a query parameter
  });
}

const LayDSBaiThiDaThi = (search = "", IDUser) => {
  console.log("Search: ", search)
  return axios.get(`/api/user/LayDanhSachBaiThiDaThiCuaUser/${IDUser}`, {
    params: { search }, // Pass search as a query parameter
  });
}

const LayDSBaiThiSoLanThi = (IDUser, token, PassCode) => {
  return axios.get(`/api/user/LayDanhSachSoLanThi/${IDUser}/${PassCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const KetQuaThi = (IDBaiThi, IDUser, PassCode, TgNopBai, token) => {
  console.log("SFSO: ", IDUser, PassCode, token)
  return axios.get(`/api/user/KetQuaThi/${IDBaiThi}/${IDUser}/${PassCode}/${TgNopBai}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const GetOneQuiz = (IDBaiThi, PassCode, token) => {
  return axios.get(`/api/user/LayMotBaiThi/${IDBaiThi}/${PassCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const KetQuaThiTheoNgayThucHien = (IDBaiThi, IDUser, PassCode, TgNopBai, token) => {
  return axios.get(`/api/user/LayMotBaiThiDaThucHien/${IDBaiThi}/${IDUser}/${PassCode}/${TgNopBai}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const NopBai = (IDUser, IDBaiThi, PassCode, token, formData) => {
  console.log("==>", IDUser, IDBaiThi, token, formData)
  return axios.post(`/api/user/NopBai/${IDUser}/${IDBaiThi}/${PassCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }, formData
  });
}

const SearchByCode = (PassCode, token) => {
  return axios.get(`/api/user/SearchByCode/${PassCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const CopyQuiz = (IDBaiThi, token) => {
  return axios.post(`/api/user/CopyQuiz/${IDBaiThi}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}


const DongMoBaiThi = (IDBaiThi, PassCode, MoDong, token) => {
  return axios.post(`/api/user/DongMoBaiThi/${IDBaiThi}/${PassCode}/${MoDong}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

const LayDSUserThucHienBaiThi = (IDBaiThi, PassCode, token) => {
  return axios.get(`/api/user/layDSKQMotBaiThi/${IDBaiThi}/${PassCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export {
  port,
  img,
  url,
  LayDSQuiz,
  GetOneQuiz,
  NopBai,
  KetQuaThi,
  LayDSQuizMotUser,
  LoginUser,
  RegisterUser,
  UserInfo,
  CapNhapUser,
  DoiMatKhau,
  SearchByCode,
  LayDSBaiThiDaThi,
  LayDSBaiThiSoLanThi,
  KetQuaThiTheoNgayThucHien,
  CopyQuiz,
  DongMoBaiThi,
  LayDSUserThucHienBaiThi
}