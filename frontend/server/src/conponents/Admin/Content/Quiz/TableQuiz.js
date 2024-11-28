import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
const TableQuiz = (props) => {
  const navigator = useNavigate()
  const { listQuiz, pageCount, currentPage, limitUser } = props;

  const handlePageClick = (event) => {
    const selectedPage = +event.selected + 1;
    props.LayDSCauHoi(+event.selected + 1)
    props.setcurrentPage(+event.selected + 1)
    console.log(
      `Quiz requested page number ${selectedPage}`
    );
  };

  const Update = (IDBaiThi) => {
    navigator(`/Admin/UpdateQuiz/${IDBaiThi}`)
  }

  return (
    <>
      <table className="table table-success table-striped table-hover table-border">
        <thead className="header-table">
          <tr className="text-center">
            <th scope="col">STT</th>
            <th scope="col">Tên bài thi</th>
            <th scope="col">Tên tác giả</th>
            {/* <th scope="col">Trạng thái</th> */}
            <th scope="col">Tác vụ</th>
          </tr>
        </thead>
        <tbody>
          {listQuiz &&
            listQuiz.length > 0 &&
            listQuiz.map((item, index) => {
              const serialNumber = (currentPage - 1) * limitUser + index + 1;
              return (
                <tr key={`table-users-${index}`}>
                  <td className="text-center">{serialNumber}</td>
                  <td>{item.TenBaiThi}</td>
                  <td>{item.NameUser}</td>
                  {/* <td>{formatDate(item.TgBatDau)}</td>
                  <td>{formatDate(item.TgKetThuc)}</td> */}
                  {/* <td>{item.TTBaiThi === 1 ? "Đang mở" : item.TTBaiThi === 0 ? "Đang đóng" : ""}</td> */}
                  <td className="center">
                    {/* <button className="btn btn-success" onClick={() => handDetailQuestions(item.IDBaiThi)}>Xem</button> */}
                    <button className="btn btn-warning mx-3" onClick={() => Update(item.IDBaiThi)}>Cập nhật</button>
                    <button
                      className="btn btn-danger"
                      onClick={() => props.handleModalDeleteQuiz(item)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          {listQuiz && listQuiz.length === 0 && (
            <tr>
              <td colSpan={"7"} className="text-center">
                Không có bài thi nào!
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="displayFlex">

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
          forcePage={props.currentPage - 1}
        />
      </div>
    </>
  );
};

export default TableQuiz;
