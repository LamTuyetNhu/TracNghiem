import SideBar from "./SideBar";
import "../../assets/scss/Admin.scss";
import { FaBars } from "react-icons/fa";
import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TitleProvider, TitleContext } from "./Content/Header/TitleContent";
import { Scrollbar } from "react-scrollbars-custom";
const Admin = (props) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TitleProvider>
      <div className="admin-container">
        <div className="admin-sidebar">
          <SideBar collapsed={collapsed} />
        </div>
        <div className="admin-content">
          <div className="admin-header">
            <FaBars
              className="admin-header__menu"
              onClick={() => setCollapsed(!collapsed)}
            />
            <TitleContext.Consumer>
              {({ title }) => (
                <h2 className="admin-header__content">{title}</h2>
              )}
            </TitleContext.Consumer>
          </div>

            <div className="admin-main">
          {/* <Scrollbar> */}
              <Outlet />
          {/* </Scrollbar> */}
            </div>
        </div>

        <ToastContainer />
      </div>
    </TitleProvider>
  );
};

export default Admin;
