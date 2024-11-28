import React, { useState } from "react";
import "../../assets/scss/Login.scss";
import { IoClose } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { LoginUser } from "../../services/apiUser";
import { toast, ToastContainer } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";
import { useDispatch } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { doLogin } from "../../redux/action/userAction";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const LoginForm = () => {
  const navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  let [isLoading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ!");
    }

    if (password.length < 6) {
      toast.error("Password có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);

    try {
      let res = await LoginUser(email, password);
      if (res.status === 200) {
          dispatch(doLogin(res));
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("IDUser", res.data.dataUser.IDUser);
          localStorage.setItem("RoleID", res.data.dataUser.RoleID);
          toast.success("Đăng nhập thành công!");

          navigate("/");
      } 
    } catch (error) {
      if (error.response && error.response.status === 500) {
        toast.error(error.response.data.message);
        setLoading(false);
      } else {
        toast.error("Đăng nhập thất bại!");
        setLoading(false);
      }

      // toast.warning("Có lỗi khi đăng nhập!");
      // setLoading(false);
    } 
  };

  const handleClose = () => {
    navigate("/");
  };

  const quenmk = () => {
    navigate("/LayLaiMatKhau");
  };

  return (
    <>
      <div className="modal1 js-modal1">
        <div className="wrapper1 js-wrapper">
          <span
            className="icon-close"
            onClick={() => {
              handleClose();
            }}
          >
            <IoClose />
          </span>

          <div className="form-box login">
            <h2>Đăng nhập</h2>
            <form>
              <div className="input-box">
                <span className="icon">
                  <MdOutlineMail />
                </span>
                <input
                  className="login-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                />
                <label>Email</label>
              </div>
              <div className="input-box">
                <span className="icon">
                  {showPassword ? (
                    <IoEyeOffOutline
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <IoEyeOutline
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </span>
                <input
                  className="login-pass"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                />
                <label>Password</label>
              </div>
              <div className="remember-forgot">
                <a
                  onClick={() => {
                    quenmk();
                  }}
                >
                  Quên mật khẩu?
                </a>
              </div>
              <button
                type="submit"
                className="btn-submit-login"
                onClick={(event) => handleLogin(event)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <AiOutlineLoading className="loaderIcon" />
                    <span>Loading...</span>{" "}
                    {/* Thay đổi text khi đang loading */}
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
              <div className="login-register">
                <p>
                Bạn chưa có tài khoản?
                  <NavLink to="/Register" className="register-link">
                    Đăng ký
                  </NavLink>
                </p>
              </div>
            </form>
          </div>
        </div>
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
      </div>

    </>
  );
};

export default LoginForm;
