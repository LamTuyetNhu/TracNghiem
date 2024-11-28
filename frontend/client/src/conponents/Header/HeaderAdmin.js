import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { UserInfo } from "../../services/apiUser";
import { useEffect, useState } from "react";
import { img } from "../../services/apiUser";
import { FaRegUser } from "react-icons/fa6";
import { CiLogout } from "react-icons/ci";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faPlus,
  faMagnifyingGlass,
  faClock,
  faSearch,
  faUser
} from "@fortawesome/free-solid-svg-icons";

const HeaderAdmin = ({ onSearch }) => {
  const navigate = useNavigate();

  var isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");
  const [nameUser, setNameUser] = useState("");
  const [imgUser, setImgUser] = useState("");

  useEffect(() => {
    if (isAuthenticated && IDUser && token) {
      getQuizUser();
    }
  }, [IDUser, token]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleLogin = () => {
    navigate("/Login");
  };

  const handleLogout = () => {
    isAuthenticated = false;
    localStorage.clear();
    window.location.reload();
    navigate("/");
  };

  const TaoMoiBaiThi = () => {
    navigate("/TaoMoiBaiThi");
  };

  const getQuizUser = async () => {
    try {
      const response = await UserInfo(IDUser, token);
      const data = response.data.dataUser;
      setNameUser(data.NameUser);
      setImgUser(data.ImageUser);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
    }
  };

  const goHome = () => {
    navigate("/");
  };

  const Search = () => {
    navigate("/TimKiem");
  };

  const LopHoc = () => {
    navigate("/LopHoc");
  };

  return (
    <>
      <div className="header-wrapper">
        <div className="header">
          <div className="mobile-route-name-container">
            <div className="logo-img-container" onClick={goHome}>
              {/* <FontAwesomeIcon icon={faHouse} className="logo-icon-center"/>  */}
            </div>
          </div>

          <div className="navigation">
            <div className="logo-img-container" onClick={goHome}></div>
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Tìm tên bài thi"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <a
                className=""
                data-cy="header-search-button"
                onClick={handleSearchChange}
              >
                <span className="search-icon-container">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
              </a>
            </div>
            <div className="navigation-items" role="tablist">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "navigation-menu-item link-is-active"
                    : "navigation-menu-item"
                }
              >
                <div>
                  <span className="nav-item-title">
                    <FontAwesomeIcon
                      icon={faHouse}
                      className="nav-item-title__icon"
                    />{" "}
                    Trang chủ
                  </span>
                </div>
                <div className="link-underline link-home-underline"></div>
              </NavLink>

              <NavLink
                to="/LopHoc"
                className={({ isActive }) =>
                  isActive
                    ? "navigation-menu-item link-is-active"
                    : "navigation-menu-item"
                }
              >
                <div>
                  <span className="nav-item-title">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="nav-item-title__icon"
                    />{" "}
                    Thành tích
                  </span>
                </div>
                <div className="link-underline"></div>
              </NavLink>

              <NavLink
                to="/BaiThiCuaToi"
                className={({ isActive }) =>
                  isActive
                    ? "navigation-menu-item link-is-active"
                    : "navigation-menu-item"
                }
              >
                <div>
                  <span className="nav-item-title">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="nav-item-title__icon"
                    />{" "}
                    Bài thi của tôi
                  </span>
                </div>
                <div className="link-underline"></div>
              </NavLink>
            </div>
          </div>

          <div className="flex-view all-center logged-out-menu">
            {isAuthenticated === false ? (
              <button
                type="button"
                className="login-button"
                onClick={() => {
                  handleLogin();
                }}
              >
                Log in
              </button>
            ) : (
              // <div className="Right-Info">
              <div className="user-info">
                <button
                  type="button"
                  className="admin-external-link"
                  data-cy="create-quiz-btn"
                  onClick={TaoMoiBaiThi}
                >
                  <span className="admin-external-link-icon">
                    <FontAwesomeIcon
                      icon={faPlus}
                      className="icon-far-plus-circle"
                    />
                  </span>{" "}
                  Tạo bài thi
                </button>
                <div className="dropdown">
                  <img src={img + imgUser} className="avatar" /> {nameUser}
                  <ul className="dropdown-menu">
                    <li className="dropdown-menu__item1">
                      <NavLink className="dropdown-item1" to="/Profile">
                        <FaRegUser className="dropdown-item1-icon" />
                        Profile
                      </NavLink>
                    </li>
                    <li className="dropdown-menu__item1" onClick={handleLogout}>
                      <NavLink className="dropdown-item1" to="">
                        <CiLogout className="dropdown-item1-icon" />
                        Log out
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>
              // </div>
            )}
          </div>
        </div>
      </div>

      <div className="featured-mobile-footer">
        <div className="mobile-footer select-none">
          <NavLink to="/" className={({ isActive }) =>
            isActive
              ? "nav-item nav-item-active"
              : "nav-item"
          } onClick={goHome}>
            <div className="nav-icon-container">
              <FontAwesomeIcon icon={faHouse} className="icon-far-home action-icon" />
            </div>
            <p className="nav-item-title">Trang chủ</p>
          </NavLink>

          <NavLink to="/TimKiem" className={({ isActive }) =>
            isActive
              ? "nav-item nav-item-active"
              : "nav-item"
          } onClick={Search}>
            <div className="nav-icon-container">
              <FontAwesomeIcon icon={faSearch} className="icon-far-home action-icon" />

            </div>
            <p className="nav-item-title">
              Tìm kiếm
            </p>
          </NavLink>

          <NavLink to="/LopHoc" className={({ isActive }) =>
            isActive
              ? "nav-item nav-item-active"
              : "nav-item"
          } onClick={LopHoc}>

            <div className="nav-icon-container">
              <FontAwesomeIcon icon={faClock} className="icon-far-home action-icon" />

            </div>
            <p className="nav-item-title">
              Lớp học
            </p>
          </NavLink>

          <NavLink to="/BaiThiCuaToi" className={({ isActive }) =>
            isActive
              ? "nav-item nav-item-active"
              : "nav-item"
          }>
            <div className="nav-icon-container">
              <FontAwesomeIcon icon={faPlus} className="icon-far-home action-icon" />

            </div>
            <p className="nav-item-title">
              Tạo mới
            </p>
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default HeaderAdmin;
