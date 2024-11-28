import "./App.scss";
import React from "react";
import Header from "./conponents/Header/HeaderAdmin";
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function App() {
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
}

export default App;
