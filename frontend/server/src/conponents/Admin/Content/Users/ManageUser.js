import { useState, useEffect, useContext } from "react";
import "../../../../assets/scss/Manage.scss";
import ModalCreateUser from "./ModalCreateUser";
import TableUser from "./TableUser";
import ModalDelete from "./ModalDelete";
import { TitleContext } from "../../Content/Header/TitleContent";
import { GetAllUsers } from "../../../../services/apiService";
import { FaSearch } from "react-icons/fa";
import Dropdown from "react-bootstrap/Dropdown";
import { Scrollbar } from "react-scrollbars-custom";

const ManageUser = (props) => {
  const LIMIT_USER = 7;
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showDeleteUser, setShowDeleteUser] = useState(false);
  const [dataDelete, setDataDelete] = useState({});
  const [listUser, setListuser] = useState([]);
  const [pageCount, sePageCount] = useState(0);
  const [currentPage, setcurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Quản lý người dùng");
    LayDSUser(currentPage, searchKeyword);
  }, [setTitle, currentPage, searchKeyword]);

  const LayDSUser = async (page, keyword) => {
    let res = await GetAllUsers(LIMIT_USER, page, keyword);
    console.log(res.data.dataUser)
    setListuser(res.data.dataUser);
    sePageCount(res.data.totalPages);
  };

  const handleShowCreateUser = (value) => {
    setShowCreateUser(value);
  };

  const handleModalDeleteUser = (user) => {
    setDataDelete(user);
    setShowDeleteUser(true);
  };

  const handleSearch = () => {
    console.log(searchKeyword)
    LayDSUser(currentPage, searchKeyword);
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
              placeholder="Nhập từ khóa..."
            />
            <div className="input-group-append">
              <button id="find" className="btn btn-outline-secondary" type="button" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>
          </div>
        </div>
        <div className="users-content__btn">
        <button
          className="btn btn-all btn-end"
          onClick={() => setShowCreateUser(true)}
        >
          + Thêm mới
        </button>
        </div>
      </div>

      <div className="users-table">
      <Scrollbar>
        <TableUser
          handleModalDeleteUser={handleModalDeleteUser}
          listUser={listUser}
          LayDSUser={LayDSUser}
          pageCount={pageCount}
          currentPage={currentPage}
          setcurrentPage={setcurrentPage}
          limitUser={LIMIT_USER}
        />
      </Scrollbar>
      </div>
      <ModalCreateUser
        show={showCreateUser}
        setShow={handleShowCreateUser}
        LayDSUser={LayDSUser}
        setcurrentPage={setcurrentPage}
      />
      <ModalDelete
        show={showDeleteUser}
        setShow={setShowDeleteUser}
        dataDelete={dataDelete}
        LayDSUser={LayDSUser}
        setcurrentPage={setcurrentPage}
      />
    </div>
  );
};

export default ManageUser;
