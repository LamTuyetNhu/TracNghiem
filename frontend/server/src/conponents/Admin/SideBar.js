import React from "react";
import {
  ProSidebar,
  Menu,
  MenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SubMenu
} from "react-pro-sidebar";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaRegImages } from "react-icons/fa6";
import "react-pro-sidebar/dist/css/styles.css";
import {
  FaTachometerAlt,
  FaGem,
  FaUser,
  FaHome,
  FaGithub,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import { DiReact } from "react-icons/di";
import "../../assets/scss/SideBar.scss";
import {Link} from "react-router-dom"
import { toast } from "react-toastify";
import { UserInfo } from "../../services/apiUser";
import { useEffect, useState } from "react";

const SideBar = (props) => {
  const { collapsed, rtl, toggled, handleToggleSidebar } = props;
  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");
  const RoleID = localStorage.getItem("RoleID");
  const [nameuser, setnameuser] = useState("");

  const navigate = useNavigate();

  var isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const account = useSelector((state) => state.user.account);

  useEffect(() => {
    User();
  }, [token, IDUser]);

  const User = async () => {
    try {
      const response = await UserInfo(IDUser, token);
      console.log(response.data.dataUser);
      if (response.status === 200) {
        setnameuser(response.data.dataUser.NameUser);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lấy dữ liệu không thành công!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const handleLogout = () => {
    navigate("/");
    isAuthenticated = false;
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      <ProSidebar
        rtl={rtl}
        collapsed={collapsed}
        toggled={toggled}
        breakPoint="md"
        onToggle={handleToggleSidebar}
      >
        <SidebarHeader>
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: 24,
              letterSpacing: "1px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer"
            }}
          >
            <DiReact size={'3em'}/>
            <div>Quản Lý Đề Thi</div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <Menu iconShape="circle">
            <MenuItem icon={<FaTachometerAlt />}>Đề thi <Link to="/Admin" /></MenuItem>
            <MenuItem icon={<FaUser />}>Người dùng <Link to="/Admin/Users" /></MenuItem>
            <MenuItem icon={<FaRegImages />}>Thông tin cá nhân <Link to="/Admin/Profile" /></MenuItem>
             
          </Menu>
        </SidebarContent>

        <SidebarFooter style={{ textAlign: "center" }}>
          <div
            className="sidebar-btn-wrapper"
            style={{
              fontSize: "20px",
              padding: "20px 24px",
            }}
          >
            <a
              // href="https://github.com/azouaoui-med/react-pro-sidebar"
              target="_blank"
              className="sidebar-btn"
              rel="noopener noreferrer"
            >
              {/* <FaGithub /> */}
              <span
                style={{
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                   {nameuser}
              </span>
            </a>

            <FiLogOut onClick={handleLogout} style={{
              color: "#ccc",
              cursor: "pointer"
            }}/>
          </div>
        </SidebarFooter>
      </ProSidebar>
    </>
  );
};

export default SideBar;
