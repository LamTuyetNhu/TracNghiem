import { useEffect, useState } from "react";
import { img, LayDSBaiThiSoLanThi } from "../../services/apiUser";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import "../../assets/scss/Manage.scss";

const DSSoLanThi = (props) => {
  const navigate = useNavigate();
  const params = useParams();

  const PassCode = params.PassCode;

  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");

  const [arrQuiz, setArrQuiz] = useState([]);
  const [tenBaiThi, setTenBaiThi] = useState("");

  useEffect(() => {
    getQuiz();
  }, [IDUser, token, PassCode]);

  const getQuiz = async () => {
    try {
      const response = await LayDSBaiThiSoLanThi(IDUser, token, PassCode);
      setArrQuiz(response.data.dataBT);
      setTenBaiThi(response.data.dataBT[0].TenBaiThi);

    } catch (error) {
      console.error("Error fetching user quizzes:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Thêm số 0 ở phía trước nếu cần
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds =
      remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // 'en-GB' for dd/MM/yyyy format
  };

  const Xem = (item) => {
    console.log("item.IDBaiThi:", item)
    localStorage.setItem("XemTgNopBai", item.TgNopBai);
    navigate(`/KetQuaThi/${item.IDBaiThi}/${item.PassCode}`)
  }

  return (
    <>
      <div className="manage-user">
        <div className="manage-name">{tenBaiThi}</div>
        <div className="users-table">
          <div className="table-container">
            <table className="table table-striped table-hover table-border table-mobile">
              <thead className="header-table">
                <tr className="text-center">
                  <th scope="col">Lần thi</th>
                  <th scope="col">Ngày thi</th>
                  <th scope="col">Thời gian thực hiện</th>
                  <th scope="col">Điểm thi</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {arrQuiz &&
                  arrQuiz.length > 0 &&
                  arrQuiz.map((item, index) => {
                    return (
                      <tr key={`table-users-${index}`}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{formatDate(item.TgNopBai)}</td>
                        <td className="text-center">{formatTime(item.TgThucHien)}s</td>
                        <td className="text-center">{item.TongDiem}</td>
                        <td className="center">
                          <button
                            className="btn btn-success mx-3"
                            onClick={() => Xem(item)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {arrQuiz && arrQuiz.length === 0 && (
                  <tr>
                    <td className="text-center">
                      Không có bài thi nào!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DSSoLanThi;
