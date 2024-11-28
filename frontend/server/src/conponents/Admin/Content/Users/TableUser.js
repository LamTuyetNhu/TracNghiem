import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";

const TableUser = (props) => {
  const navigator = useNavigate()
  const {listUser, pageCount, currentPage, limitUser} = props;

  const handlePageClick = (event) => {
    const selectedPage = +event.selected + 1;
    props.LayDSUser(+event.selected + 1, 3, "")
    props.setcurrentPage(+event.selected + 1)
    console.log(
      `User requested page number ${selectedPage}`
    );
  };

  const Update = (IDUser) => {
    // navigator(`/Admin/UpdateUser/${IDUser}`)
  }

  return (
    <>
      <table className="table table-success table-striped table-hover table-border">
        <thead>
          <tr className="text-center">
            <th scope="col">STT</th>
            <th scope="col">Tên</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Tác vụ</th>
          </tr>
        </thead>
        <tbody>
          {listUser &&
            listUser.length > 0 &&
            listUser.map((item, index) => {
              const serialNumber = (currentPage - 1) * limitUser + index + 1;
              return (
                <tr key={`table-users-${index}`}>
                  <td className="text-center">{serialNumber}</td>
                  <td>{item.NameUser}</td>
                  <td>{item.EmailUser}</td>
                  <td>{item.RoleID}</td>
                  <td className="center">
                    <button className="btn btn-warning mx-3" onClick={() => Update(item.IDUser)}>Cập nhật</button>
                    <button
                      className="btn btn-danger"
                      onClick={() => props.handleModalDeleteUser(item)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          {listUser && listUser.length === 0 && (
            <tr>
              <td colSpan={"5"} className="text-center">
                Không có người dùng nào!
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

export default TableUser;
