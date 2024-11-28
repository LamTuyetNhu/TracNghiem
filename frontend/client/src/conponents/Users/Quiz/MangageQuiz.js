import { useState, useEffect } from "react";
import { GetAllQuizOfUSer } from "../../../services/apiService";
import { DongMoBaiThi, CopyQuiz } from "../../../services/apiUser";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "../../../assets/scss/Manage.scss";
import ModalDeleteQuiz from "./ModalDelete";
import ReactPaginate from "react-paginate";
import "../../../assets/scss/trangthai.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageQuiz = (props) => {
  const LIMIT_QUIZ = 7;
  const [listQuiz, setListQuiz] = useState([]);
  const [pageCount, sePageCount] = useState(0);
  const [currentPage, setcurrentPage] = useState(1);
  // const [ttBaiThi, setTtBaiThi] = useState(3);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dataDelete, setDataDelete] = useState({});
  const IDUser = localStorage.getItem("IDUser");
  const [showDeleteQuiz, setShowDeleteQuiz] = useState(false);
  const navigate = useNavigate(); // Thêm điều hướng

  useEffect(() => {
    LayDSCauHoi(currentPage, searchKeyword);
  }, [currentPage, searchKeyword]);

  const LayDSCauHoi = async (page, keyword) => {
    try {
      let res = await GetAllQuizOfUSer(IDUser, LIMIT_QUIZ, page, keyword);
      setListQuiz(res.data.dataBaiThi);
      sePageCount(res.data.totalPages);
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  };

  const handleModalDeleteQuiz = (quiz) => {
    setDataDelete(quiz);
    setShowDeleteQuiz(true);
  };

  // const handleDropdownChange = (value) => {
  //   setTtBaiThi(value);
  //   setcurrentPage(1); // Reset currentPage to 1 when changing dropdown value
  // };

  const handleSearch = () => {
    LayDSCauHoi(currentPage, searchKeyword);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageClick = (event) => {
    const selectedPage = event.selected + 1;
    setcurrentPage(selectedPage); // Sửa chỗ này để gọi LayDSCauHoi trực tiếp
  };

  const Update = (IDBaiThi) => {
    navigate(`/CapNhatBaiThi/${IDBaiThi}`);
  };

  const handleToggleStatus = async (item) => {
    try {
      const response = await DongMoBaiThi(
        item.IDBaiThi,
        item.PassCode,
        item.MoDong
      );

      if (response.status === 200) {
        LayDSCauHoi(currentPage, searchKeyword);
      } else {
        const updatedStatus = item.MoDong === 1 ? 0 : 1;
        if (updatedStatus === 0) {
          toast.warning("Không mở được bài thi!");
        } else {
          toast.warning("Không đóng được bài thi!");
        }
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleReNewQuiz = async (item) => {
    try {
      let res = await CopyQuiz(item.IDBaiThi);
      console.log(res.data);
      if (res.status === 200) {
        LayDSCauHoi(currentPage, searchKeyword);
        toast.success(
          res.data.message + "\nPassCode của bạn là: " + res.data.PassCode
        );
      }
    } catch (error) {
      toast.error("Có lỗi khi tạo lại!");
    }
  };

  const date = new Date();

  // Định dạng ngày tháng
  function formatDateTime(dateString) {
    const date = new Date(dateString);

    // Định dạng ngày tháng
    const formattedDate = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Định dạng giờ phút giây
    const formattedTime = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Sử dụng định dạng 24 giờ
    });

    // Trả về chuỗi ngày giờ hoàn chỉnh
    return `${formattedDate} ${formattedTime}`;
  }

  const Open = (IDBaiThi, PassCode) => {
    navigate(`/ThongTinBaiThi/${IDBaiThi}/${PassCode}`);
  };

  const handleStartExam = (IDBaiThi, PassCode) => {
    navigate(`/DSNguoiDungThucHien/${IDBaiThi}/${PassCode}`);
  };

  return (
    <>
      <div className="manage-user">
        <div className="users-content">
          <div className="search">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tên bài thi hoặc passcode"
              />
              <div className="input-group-append">
                <button
                  id="find"
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleSearch}
                >
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>

          <div className="users-content__btn">
            <button className="btn btn-all">
              <Link
                to="/TaoMoiBaiThi"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                + Thêm mới
              </Link>
            </button>
          </div>
        </div>

        <div className="users-table">
          <div className="table-container">
            <table className="table table-striped table-hover table-border table-mobile">
              <thead className="header-table">
                <tr className="text-center">
                  <th scope="col">STT</th>
                  <th scope="col">Tên bài thi</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col">PassCode</th>
                  {/* <th scope="col">Trạng thái</th> */}
                  <th scope="col">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {listQuiz &&
                  listQuiz.length > 0 &&
                  listQuiz.map((item, index) => {
                    const serialNumber =
                      (currentPage - 1) * LIMIT_QUIZ + index + 1;
                    return (
                      <tr key={`table-users-${index}`}>
                        <td className="text-center">{serialNumber}</td>
                        <td>{item.TenBaiThi}</td>
                        <td className="text-center">
                          {formatDateTime(item.NgayMo)}
                        </td>
                        <td className="text-center">{item.PassCode}</td>
                        {/* <td className="text-center">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.MoDong === 1}
                              onChange={() => handleToggleStatus(item)}
                            />
                            <span className="slider"></span>
                          </label>
                        </td> */}
                        <td className="center">
                          <button
                            className={`btn btn-violet ${
                              item.MoDong === 0 ? "disabled" : ""
                            }`}
                            onClick={
                              item.MoDong === 1
                                ? () => Open(item.IDBaiThi, item.PassCode)
                                : null
                            }
                            disabled={item.MoDong === 0}
                          >
                            Mở thi
                          </button>
                          {/* <button
                        className="btn btn-violet " onClick={() => Open(item.IDBaiThi, item.PassCode)}>
                        Mở thi
                      </button> */}
                          <button
                            className="btn btn-warning mx-3"
                            onClick={() => Update(item.IDBaiThi)}
                          >
                            Cập nhật
                          </button>
                          <button
                            className="btn btn-danger "
                            onClick={() => handleModalDeleteQuiz(item)}
                          >
                            Xóa
                          </button>

                          <button
                            className="btn btn-success mx-3"
                            onClick={() => handleReNewQuiz(item)}
                          >
                            Tạo lại
                          </button>

                          {/* <button
                            class="btn btn-secondary"
                            onClick={() =>
                              handleStartExam(item.IDBaiThi, item.PassCode)
                            }
                          > */}
                             <button
                            className={`btn btn-secondary ${
                              item.MoDong === 1 ? "disabled" : ""
                            }`}
                            onClick={
                              item.MoDong === 0
                                ? () => handleStartExam(item.IDBaiThi, item.PassCode)
                                : null
                            }
                            disabled={item.MoDong === 1}
                          >
                            Xem kết quả
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {listQuiz && listQuiz.length === 0 && (
                  <tr>
                    <td colSpan={"5"} className="text-center">
                      Không có bài thi nào!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination-container displayFlex">
            <ReactPaginate
              nextLabel=">"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              marginPagesDisplayed={2}
              pageCount={pageCount}
              previousLabel="<"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakLabel="..."
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
              renderOnZeroPageCount={null}
              forcePage={currentPage - 1}
            />
          </div>
        </div>

        <ModalDeleteQuiz
          show={showDeleteQuiz}
          setShow={setShowDeleteQuiz}
          dataDelete={dataDelete}
          LayDSCauHoi={LayDSCauHoi}
          setcurrentPage={setcurrentPage}
        />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000} // Đặt thời gian tự động đóng (3 giây)
        hideProgressBar={false} // Hiển thị thanh tiến trình nếu cần
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default ManageQuiz;
