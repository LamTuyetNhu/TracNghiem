import React from "react";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { MdOutlineMail } from "react-icons/md";
import { port } from "../../services/apiUser";
import axios from "axios";
import { NavLink,useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import "../../assets/scss/Login.scss";
import { toast, ToastContainer } from "react-toastify";

const LayLaiMatKhau = ({ onHide }) => {
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  useEffect(() => {}, []);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[a-zA-Z0-9._%+&-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  };

  const [errors, setErrors] = useState({
    email: "",
  });

  const LayLaiMatKhau = async (event) => {
    event.preventDefault(); // Ngăn không để form reload trang

    const newErrors = {
      email: !email
        ? "Vui lòng nhập Email"
        : !validateEmail(email)
        ? "Email không hợp lệ!"
        : "",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error !== "")) {
      toast.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const response = await axios.post(
        `${port}/api/user/guiMaXacNhan`,
        { email }
      );

      console.log("Lay lai mk:", response.success)
      if ( response.success ) {
        toast.success("Đã gửi mật khẩu mới!");
      } else {
        toast.error("Gửi mật khẩu mới thất bại");
      }
    } catch (error) {
      toast.warning("Kiểm tra lại Email!");
      console.error("Đã xảy ra lỗi:", error);
    }
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleClose = () => {
    navigate("/");
  };

  const dangnhap = () => {
    navigate("/Login");
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
            <h2>Bạn quên mật khẩu?</h2>
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
                  onChange={handleChange}
                  required
                />
                <label>Email</label>
              </div>
              <div className="remember-forgot">
                <a
                  onClick={() => {
                    dangnhap();
                  }}
                >
                 Quay về trang đăng nhập
                </a>
              </div>
              <button
                type="submit"
                className="btn-submit-login"
                onClick={LayLaiMatKhau}
              >
                Gửi
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

export default LayLaiMatKhau;
