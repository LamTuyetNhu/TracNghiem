import React, { useState } from "react";
import "../../assets/scss/Login.scss";
import { IoClose } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { CiLock } from "react-icons/ci";
import { NavLink, useNavigate, Navigate } from "react-router-dom";
import { LoginUser } from "../../services/apiUser";
import { toast } from "react-toastify";
import { AiOutlineLoading } from "react-icons/ai";
import LoadingBar from "react-top-loading-bar";
import { useDispatch } from "react-redux";
import { doLogin } from "../../redux/action/userAction";
const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [isLoading, setLoading] = useState(false);
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
        const RoleID = res.data.dataUser.RoleID;
        console.log("RoleID: ", RoleID);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("IDUser", res.data.dataUser.IDUser);
        localStorage.setItem("RoleID", res.data.dataUser.RoleID);

        // toast.success(res.data.message);
        // setLoading(false);
        if (RoleID === "admin") {
          console.log("Admin:", RoleID);
          navigate("/Admin");
        } else {
        toast.error("Bạn không phải Admin!");
        }
      } else {
        toast.error("Đăng nhập thất bại!");
        setLoading(false);
      }
    } catch (error) {
      if (error.response) {
        // Kiểm tra xem có phản hồi từ máy chủ không
        if (error.response.status === 400) {
          // Kiểm tra nếu mã trạng thái là 409 (Conflict)
          toast.error(error.response.data.message);
          setLoading(false);
        } else {
          toast.error("Đã xảy ra lỗi khi đăng nhập!");
          setLoading(false);
        }
      } else {
        toast.error("Đã xảy ra lỗi khi đăng nhập!");
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    navigate("/");
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
                  <CiLock />
                </span>
                <input
                  className="login-pass"
                  type="password"
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
                <a href="#">Forgot Password?</a>
              </div>
              <button
                type="submit"
                className="btn-submit-login"
                onClick={(event) => handleLogin(event)}
                disabled={isLoading}
              >
                {isLoading === true && (
                  <AiOutlineLoading className="loaderIcon" />
                )}
                <span>Login</span>
              </button>
              {/* <div className="login-register">
                <p>
                  Don't have an account?
                  <NavLink to="/Register" className="register-link">
                    Register
                  </NavLink>
                </p>
              </div> */}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
