import "../../assets/scss/User.scss";
import { Outlet} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import Header from "../Header/HeaderAdmin";

const User = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  return (
    <div className="app-container">
    <div className="header-container">
      <Header onSearch={handleSearch} />
    </div>
    <div className="main-container">
      <div className="sidenav-container"></div>
      <div className="app-content">
        <Outlet context={{ searchTerm }}/>
      </div>
    </div>
  </div>
  );
};

export default User;
