import { useEffect, useState, useContext } from "react";
import { CapNhapUser, img, UserInfo, DoiMatKhau } from "../../../services/apiUser";
import "../../../assets/scss/ListQuiz.scss";
import img2 from "../../../assets/images/3.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { Collapse } from "react-bootstrap";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import Carousel from "react-bootstrap/Carousel";
import {TitleContext} from "../Content/Header/TitleContent"

const Profile = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { setTitle } = useContext(TitleContext);

  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");
  const [profile, setProfile] = useState({});
  const [nameUser, setNameUser] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setTitle("Thông tin cá nhân");
    getQuizUser();
  }, [IDUser, token, setTitle]);

  const getQuizUser = async () => {
    try {
      const response = await UserInfo(IDUser, token);
      toast.success("Lấy dữ liệu thành công!");
      const data = response.data.dataUser;
      setProfile(data);
      setNameUser(data.NameUser);
      setEmailUser(data.EmailUser);
    } catch (error) {
      toast.error("Lấy dữ liệu không thành công!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const UpdateProfile = async () => {
    if (!nameUser) {
      toast.error("Tên không được để trống.");
      return;
    }

    if (!emailUser) {
      toast.error("Email không được để trống.");
      return;
    }

    if (!isValidEmail(emailUser)) {
      toast.error("Email không hợp lệ.");
      return;
    }

    try {
      const response = await CapNhapUser(
        IDUser,
        { NameUser: nameUser, EmailUser: emailUser },
        token
      );
      if (response.status === 200) {
        getQuizUser()
        toast.success("Cập nhật thành công!");
        setProfile({ ...profile, NameUser: nameUser, EmailUser: emailUser });

      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (error) {
      toast.error("Cập nhật không thành công!");
      console.error("Error updating user profile:", error);
    }
  };

  const UpdatePassword = async () => {
    if (oldPassword.length < 6 || newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      const response = await DoiMatKhau(
        IDUser,
        { oldPassword, newPassword },
        token
      );
      if (response.status === 200) {
        getQuizUser()
        toast.success(response.data.message);
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error("Cập nhật thất bại!");
      }
    } catch (error) {
      toast.error("Cập nhật không thành công!");
      console.error("Error updating user profile:", error);
    }
  };

  return (
    <>
      <Carousel>
        <Carousel.Item>
          <>
            <div className="card card-info mt-3">
              <div className="row g-0">
                <div className="col-md-4 card-info__img">
                  <img
                    src={img + profile.ImageUser}
                    className="img-fluid rounded-start"
                    alt="..."
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h5 className="card-title">Thông tin cá nhân</h5>
                    <Form>
                      <Form.Group className="mb-3" controlId="nameInput">
                        <Form.Label>Tên của bạn</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Tên của bạn"
                          value={nameUser}
                          onChange={(e) => setNameUser(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="emailInput">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="name@gmail.com"
                          value={emailUser}
                          onChange={(e) => setEmailUser(e.target.value)}
                        />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="roleInput">
                        <Form.Label>Vai trò</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Vai trò của bạn"
                          value={profile.RoleID}
                          disabled
                        />
                      </Form.Group>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer">
              <button
                className="footer-icon update-btn"
                onClick={UpdateProfile}
              >
                Cập nhật
              </button>
            </div>
          </>
        </Carousel.Item>
        <Carousel.Item>
          <>
            <div className="card card-info mt-3">
              <div className="row g-0">
                <div className="col-md-12">
                  <div className="card-body">
                    <h5 className="card-title">Cập nhật mật khẩu</h5>
                    <Form>
                      <Form.Group className="mb-3" controlId="oldPasswordInput">
                        <Form.Label>Mật khẩu cũ</Form.Label>
                        <div className="password-input">
                          <Form.Control
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                          />
                          {showOldPassword ? (
                            <IoEyeOffOutline
                              className="password-toggle"
                              onClick={() =>
                                setShowOldPassword(!showOldPassword)
                              }
                            />
                          ) : (
                            <IoEyeOutline
                              className="password-toggle"
                              onClick={() =>
                                setShowOldPassword(!showOldPassword)
                              }
                            />
                          )}
                        </div>
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="newPasswordInput">
                        <Form.Label>Mật khẩu mới</Form.Label>
                        <div className="password-input">
                          <Form.Control
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          {showNewPassword ? (
                            <IoEyeOffOutline
                              className="password-toggle"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            />
                          ) : (
                            <IoEyeOutline
                              className="password-toggle"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                            />
                          )}
                        </div>
                      </Form.Group>
                      <Form.Group
                        className="mb-3"
                        controlId="confirmPasswordInput"
                      >
                        <Form.Label>Xác nhận lại mật khẩu</Form.Label>
                        <div className="password-input">
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          {showConfirmPassword ? (
                            <IoEyeOffOutline
                              className="password-toggle"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            />
                          ) : (
                            <IoEyeOutline
                              className="password-toggle"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            />
                          )}
                        </div>
                      </Form.Group>
                    </Form>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer">
              <button
                className="footer-icon success-btn"
                onClick={() => UpdatePassword()}
              >
                Lưu mật khẩu
              </button>
            </div>
          </>
        </Carousel.Item>
      </Carousel>
    </>
  );
};

export default Profile;
