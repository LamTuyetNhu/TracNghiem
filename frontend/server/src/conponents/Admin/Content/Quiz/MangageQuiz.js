import TableQuiz from "./TableQuiz";
import { useState, useEffect, useContext } from "react";
import "../../../../assets/scss/Manage.scss";
import ModalDelete from "./ModalDelete";
import ModalUpdate from "./ModalUpdateQuiz";
import Dropdown from "react-bootstrap/Dropdown";
import { GetAllQuiz } from "../../../../services/apiService";
import { TitleContext } from "../../Content/Header/TitleContent";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom"
const ManageQuiz = (props) => {
  const LIMIT_QUIZ = 7;
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showUpdateQuiz, setShowUpdateQuiz] = useState(false);
  const [showDeleteQuiz, setShowDeleteQuiz] = useState(false);
  const [dataDelete, setDataDelete] = useState({});
  const [listQuiz, setListQuiz] = useState([]);
  const [pageCount, sePageCount] = useState(0);
  const [currentPage, setcurrentPage] = useState(1);
  const [ttBaiThi, setTtBaiThi] = useState(3);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Quản lý bài thi");
    LayDSCauHoi(currentPage, ttBaiThi, searchKeyword);
  }, [setTitle, currentPage, ttBaiThi, searchKeyword]);

  const LayDSCauHoi = async (page, TTBaiThi, keyword) => {
    let res = await GetAllQuiz(LIMIT_QUIZ, page, TTBaiThi, keyword);
    setListQuiz(res.data.dataBaiThi);
    sePageCount(res.data.totalPages);
  };

  const handleShowCreateQuiz = (value) => {
    setShowCreateQuiz(value);
  };

  const handleShowUpdateQuiz = (quiz) => {
    setDataDelete(quiz);
    setShowUpdateQuiz(quiz);
  };

  const handleModalDeleteQuiz = (quiz) => {
    console.log(quiz);
    setDataDelete(quiz);
    setShowDeleteQuiz(true);
  };

  const handleDropdownChange = (value) => {
    setTtBaiThi(value);
    setcurrentPage(1); // Reset currentPage to 1 when changing dropdown value
  };

  const handleSearch = () => {
    console.log(searchKeyword)
    LayDSCauHoi(currentPage, ttBaiThi, searchKeyword);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="manage-user">
      <div className="users-content">
        <div className="search">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tên bài thi hoặc tác giả..."
            />
            <div className="input-group-append">
              <button id="find" className="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>
        </div>

        <div className="users-content__btn">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {ttBaiThi === 0
                ? "Đang đóng"
                : ttBaiThi === 1
                  ? "Đang mở"
                  : ""
              }
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => handleDropdownChange(0)}>
                Đang đóng
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleDropdownChange(1)}>
                Đang mở
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <button className="btn btn-all">
            <Link to="/CreateQuiz" style={{ color: 'inherit', textDecoration: 'none' }}>
              + Thêm mới
            </Link>
          </button>
        </div>
      </div>
      <div className="users-table">
        <TableQuiz
          handleModalDeleteQuiz={handleModalDeleteQuiz}
          handleShowUpdateQuiz={handleShowUpdateQuiz}
          listQuiz={listQuiz}
          LayDSCauHoi={LayDSCauHoi}
          pageCount={pageCount}
          currentPage={currentPage}
          setcurrentPage={setcurrentPage}
          limitUser={LIMIT_QUIZ}
        />
      </div>
      {/* <ModalCreate
        show={showCreateQuiz}
        setShow={handleShowCreateQuiz}
        LayDSCauHoi={LayDSCauHoi}
        setcurrentPage={setcurrentPage}
      /> */}
      <ModalUpdate
        show={showUpdateQuiz}
        setShow={handleShowUpdateQuiz}
        dataUpdate={dataDelete}
        LayDSCauHoi={LayDSCauHoi}
        setcurrentPage={setcurrentPage}
      />
      <ModalDelete
        show={showDeleteQuiz}
        setShow={setShowDeleteQuiz}
        dataDelete={dataDelete}
        LayDSCauHoi={LayDSCauHoi}
        setcurrentPage={setcurrentPage}
      />
    </div>
  );
};

export default ManageQuiz;
