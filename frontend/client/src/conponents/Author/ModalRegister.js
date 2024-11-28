import React, { useState } from "react";
import "../../assets/scss/Login.scss";
import { IoClose } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom";
import { RegisterUser, LoginUser } from "../../services/apiUser";
import { toast, ToastContainer } from "react-toastify";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { doLogin } from "../../redux/action/userAction";

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  let [name, setName] = useState("");
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!name) {
      toast.error("Vui lòng nhập tên!")
    }

    if (!validateEmail(email)) {
      toast.error("Email không hợp lệ!")
    }

    if (password.length < 6) {
      toast.error("Password có ít nhất 6 ký tự!")
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    try {

      let res = await RegisterUser(name, email, password);
  
      if(res.status === 200) {
        toast.success(res.data.message)

        let response = await LoginUser(email, password);
      if (response.status === 200) {
          dispatch(doLogin(response));
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("IDUser", response.data.dataUser.IDUser);
          localStorage.setItem("RoleID", response.data.dataUser.RoleID);
          toast.success("Đăng nhập thành công!");

          navigate("/");
      }

      } else {
        toast.error("Đăng ký thất bại!");
      }
    } catch (error) {
      if (error.response.status === 400) { // Kiểm tra xem có phản hồi từ máy chủ không
       toast.error(error.response.data.message)
      } else {
        toast.error("Đăng ký thất bại!");
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
            <h2>Đăng ký</h2>
            <form>
              <div className="input-box">
                <span className="icon">
                  <FaRegUser />
                </span>
                <input
                  className="login-name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  required
                />
                <label>Username</label>
              </div>

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
              <div className="input-box">
                <span className="icon">
                {confirmPassword ? (
                    <IoEyeOffOutline
                      onClick={() => setConfirmPassword(!confirmPassword)}
                    />
                  ) : (
                    <IoEyeOutline
                      onClick={() => setConfirmPassword(!confirmPassword)}
                    />
                  )}
                </span>
                <input
                  className="login-pass"
                  type={confirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                  required
                />
                <label>Xác nhận lại Password</label>
              </div>
              <button
                type="submit"
                className="btn-submit-login"
                onClick={(event) => handleLogin(event)}
              >
                Đăng ký
              </button>
              <div className="login-register">
                <p>
                Bạn đã có tài khoản?
                  <NavLink to="/Login" className="register-link">
                    Đăng nhập
                  </NavLink>
                </p>
              </div>
            </form>
          </div>
        </div>
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
      </div>
    </>
  );
};

export default RegisterForm;
