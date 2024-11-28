import { Routes, Route } from "react-router-dom";
import Admin from "./conponents/Admin/Admin";
import DashBoard from "./conponents/Admin/Content/DashBoard";
import ManageUser from "./conponents/Admin/Content/Users/ManageUser";
import ProfileAdmin from "./conponents/Admin/Profile/Profile";

import LoginForm from "./conponents/Author/ModalLogin";
import NotFound from "./conponents/NotFound/NotFoundPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManageQuiz from "./conponents/Admin/Content/Quiz/MangageQuiz";
import Questions from "./conponents/Admin/Content/Question/Question";
import PrivateRoute from "./routers/PrivateRouter";
import CreateQuiz from "./conponents/Admin/Content/Quiz/CreateQuiz";
import UpdateQuiz from "./conponents/Admin/Content/Quiz/UpdateQuiz";

const Layout = (props) => (
  <>
    <Routes>
      <Route index path="/" element={<LoginForm />} />
      <Route path="*" element={<NotFound />} />

      <Route
        path="/Admin"
        element={
          <PrivateRoute roles={["admin"]}>
            <Admin />
          </PrivateRoute>
        }
      >
        <Route index element={<ManageQuiz />} />
        <Route path="Users" element={<ManageUser />} />
        {/* <Route path="Quiz" element={<ManageQuiz />} /> */}
        <Route path="Quiz/Questions/:IDBaiThi" element={<Questions />} />
        <Route path="Profile" element={<ProfileAdmin />} />
      </Route>
      <Route path="CreateQuiz" element={<CreateQuiz />} />
      <Route path="Admin/UpdateQuiz/:IDBaiThi" element={<UpdateQuiz />} />
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
