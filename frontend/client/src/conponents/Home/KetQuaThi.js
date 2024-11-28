import io from "socket.io-client";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../assets/scss/Manage.scss";
import "../../assets/scss/trangthai.scss";
import { IoMdClose } from "react-icons/io";
import { port } from "../../services/apiUser";
const socket = io(port);

const KetQuaThi = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [submittedUsers, setSubmittedUsers] = useState(() => {
    // Lấy dữ liệu từ localStorage khi trang tải lại
    const savedData = localStorage.getItem("submittedUsers");
    return savedData ? JSON.parse(savedData) : [];
  });
  const IDBaiThi = params.IDBaiThi;
  const IDUser = localStorage.getItem("IDUser");

  useEffect(() => {
    console.log(
      `Kết nối tới phòng chờ với IDBaiThi: ${IDBaiThi}, IDUser: ${IDUser}`
    );

    // Join phòng chờ
    socket.emit("joinWaitingRoom", { IDBaiThi, IDUser });

    // Bắt sự kiện userSubmittedQuiz khi có người nộp bài
    socket.on("userSubmittedQuiz", (userResults) => {
      console.log("Nhận kết quả từ người dùng:", userResults);

      setSubmittedUsers((prevUsers) => {
        const updatedUsers = [...prevUsers, userResults];
        // Lưu vào localStorage để đảm bảo dữ liệu không mất khi tải lại
        localStorage.setItem("submittedUsers", JSON.stringify(updatedUsers));
        return updatedUsers;
      });
    });

    // Cleanup function khi component unmount
    return () => {
      socket.off("userSubmittedQuiz"); // Ngừng lắng nghe sự kiện khi component bị hủyư
      console.log("Socket disconnected host");
    };
  }, [IDBaiThi, IDUser]);

  // Sắp xếp danh sách theo điểm giảm dần
  const sortedUsers = [...submittedUsers].sort((a, b) => b.score - a.score);

  const handleClose = () => {
    socket.emit("leaveRoom", { IDBaiThi, IDUser });
    localStorage.removeItem("submittedUsers");
    setSubmittedUsers([]);
    navigate("/"); // Điều hướng người dùng về trang khác
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


  return (
    <div className="manage-user">
        <div className="app-header-container-result">
            <button className="btn-close" onClick={handleClose}>
              <IoMdClose className="btn-close__icon" />
            </button>
          </div>
      <h1 className="manage-name">Kết quả thi</h1>
      <h5 className="manage-name">Danh sách người dùng đã nộp bài</h5>


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
              {sortedUsers && sortedUsers.length > 0 &&
                
                sortedUsers.map((user, index) => {
                  return (
                  <tr key={index}>
                    <td className="text-center">{index +1 }</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td className="text-center">{user.score}</td>
                    <td className="text-center">{formatTime(user.tgthuchien)}</td>
                    <td className="text-center">{formatDateTime(user.tgnop)}</td>
                  </tr>

                  )
                }
                )}
              {sortedUsers && sortedUsers.length === 0 && (
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
