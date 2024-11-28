import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../assets/scss/Manage.scss";
import "../../assets/scss/trangthai.scss";
import { IoMdClose } from "react-icons/io";
import { LayDSUserThucHienBaiThi } from "../../services/apiUser";
import * as XLSX from "xlsx"

const KetQuaThi = () => {
  const params = useParams();
  const navigate = useNavigate();

  const IDBaiThi = params.IDBaiThi;
  const PassCode = params.PassCode;
  const token = localStorage.getItem("token");

  const [arrUser, setArrUser] = useState([]);

  useEffect(() => {
    DSNopBai();
  }, [IDBaiThi, PassCode, token]);

  const DSNopBai = async () => {
    try {
      const response = await LayDSUserThucHienBaiThi(IDBaiThi, PassCode, token);
      setArrUser(response.data.dataDiemThi);
    } catch (error) {
      console.error("Error fetching user quizzes:", error);
    }
  };

  const date = new Date();

  // Định dạng ngày tháng
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    
    // Định dạng ngày tháng
    const formattedDate = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Định dạng giờ phút giây
    const formattedTime = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // Sử dụng định dạng 24 giờ
    });
    
    // Trả về chuỗi ngày giờ hoàn chỉnh
    return `${formattedDate} ${formattedTime}`;
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
  
    // Thêm số 0 ở phía trước nếu cần
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
  
    return `${formattedMinutes}:${formattedSeconds}`;
  };

   // Hàm xuất file Excel
   const exportToExcel = () => {
    // Chuẩn bị dữ liệu cho file Excel
    const data = arrUser.map((item, index) => ({
      STT: index + 1,
      Tên: item.NameUser,
      Email: item.EmailUser,
      Điểm: item.TongDiem,
      "Thời gian thực hiện": formatTime(item.TgThucHien),
      "Thời gian nộp": formatDateTime(item.TgNopBai)
    }));

    // Tạo worksheet và workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachKetQua");

    // Xuất file Excel
    XLSX.writeFile(workbook, "DanhSachKetQua.xlsx");
  };

  return (
    <div className="manage-user">
      <h5 className="manage-name">Danh sách người dùng đã nộp bài</h5>

      <div className="btnRight">
            <button className="btn btn-all" onClick={exportToExcel}>
                Xuất file Excel
            </button>
          </div>

      <div className="users-table">
        <div className="table-container">
          <table className="table table-striped table-hover table-border table-mobile">
            <thead className="header-table">
              <tr className="text-center">
                <th scope="col">STT</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Điểm</th>
                <th>Thời gian thực hiện (s)</th>
                <th>Thời gian nộp</th>
              </tr>
            </thead>
            <tbody>
              {arrUser &&
                arrUser.length > 0 &&
                arrUser.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.NameUser}</td>
                      <td>{item.EmailUser}</td>
                      <td className="text-center"> {item.TongDiem}</td>
                      <td className="text-center"> {formatTime(item.TgThucHien)}</td>
                      <td className="text-center">

                        {formatDateTime(item.TgNopBai)}
                      </td>
                    </tr>
                  );
                })}

{arrUser && arrUser.length === 0 && (
                  <tr>
                    <td colSpan={"6"} className="text-center">
                      Không có bài được nộp!
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KetQuaThi;
