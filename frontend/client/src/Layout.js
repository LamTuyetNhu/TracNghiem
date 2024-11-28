import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App";
import Home from "./conponents/Home/Home";
import LoginForm from "./conponents/Author/ModalLogin";
import ModalRegister from "./conponents/Author/ModalRegister";
import NotFound from "./conponents/NotFound/NotFoundPage";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./conponents/Users/Profile";
import DoQuiz from "./conponents/Users/DoQuiz";
import ResultQuiz from "./conponents/Users/ResultQuiz";
import CreateQuiz from "./conponents/Users/Quiz/CreateQuiz";
import TimKiem from "./conponents/Home/Search";
import LopHoc from "./conponents/Home/LopHoc";
import QuizList from "./conponents/Users/Quiz/MangageQuiz";
import UpdateQuiz from "./conponents/Users/Quiz/UpdateQuiz";
import Waiting from "./conponents/Home/WaitingRoom";
import DSLanThi from "./conponents/Home/DSLanThi";
import XemKetQua from "./conponents/Home/XemKetQua";
import KetQuaThi from "./conponents/Home/KetQuaThi";
import XemKetQuaTatCaNguoiDung from "./conponents/Users/XemKetQuaTatCaNguoiDung"
import LayLaiMatKhau from "./conponents/Author/QuenMatKhau";
const Layout = (props) => (
  <>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="TimKiem" element={<TimKiem />} />
        <Route path="LopHoc" element={<LopHoc />} />
        <Route path="Profile" element={<Profile />} />
        <Route path="BaiThiCuaToi" element={<QuizList />} />
        <Route path="DiemBaiThi/:PassCode" element={<DSLanThi />} />
        <Route path="DSNguoiDungThucHien/:IDBaiThi/:PassCode" element={<XemKetQuaTatCaNguoiDung />} />
      </Route>

      <Route path="QuizResults/:IDBaiThi/:PassCode" element={<KetQuaThi />} />
      <Route path="KetQuaThi/:IDBaiThi/:PassCode" element={<XemKetQua />} />
      <Route path="ThongTinBaiThi/:IDBaiThi/:PassCode" element={<Waiting />} />
      <Route path="DoQuiz/:IDBaiThi/:PassCode" element={<DoQuiz />} />
      <Route path="Result/:IDBaiThi/:PassCode" element={<ResultQuiz />} />

      <Route path="TaoMoiBaiThi" element={<CreateQuiz />} />
      <Route path="CapNhatBaiThi/:IDBaiThi" element={<UpdateQuiz />} />

      <Route path="/Login" element={<LoginForm />} />
      <Route path="/Register" element={<ModalRegister />} />
      <Route path="/LayLaiMatKhau" element={<LayLaiMatKhau />} />

      <Route path="*" element={<NotFound />} />
    </Routes>

    <ToastContainer
      position="top-right"
      autoClose={5000}
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

export default Layout;
