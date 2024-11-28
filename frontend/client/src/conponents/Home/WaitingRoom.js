// import { useEffect, useState } from "react";
// import { img, GetOneQuiz, KetQuaThi } from "../../services/apiUser";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import { CiClock1 } from "react-icons/ci";
// import { IoMdClose } from "react-icons/io";
// import anh from "../../assets/images/mythuat.jpg";
// import "../../assets/scss/ResultQuiz.scss";
// import { useSelector } from "react-redux";

// const Waiting = () => {
//   const navigate = useNavigate();
//   const params = useParams();
//   const isAuthenticated = useSelector((state) => state.user.isAuthenticated);

//   const IDBaiThi = params.IDBaiThi;
//   const PassCode = params.PassCode;

//   const token = localStorage.getItem("token");
//   const IDUser = localStorage.getItem("IDUser");
//   const [arrQuiz, setArrQuiz] = useState([]);
//   const [diem, setDiem] = useState("");
//   const [socauhoi, setSocauhoi] = useState("");
//   const [tenbaithi, settenbaithi] = useState("");
//   const [tgthi, settgthi] = useState("");

//   useEffect(() => {
//     getOneQuiz();
//   }, [IDUser, token, IDBaiThi, PassCode]);

//   const getOneQuiz = async () => {
//     try {
//       const response = await GetOneQuiz(IDBaiThi, PassCode, token);
//       if (response.status === 200) {
//         setArrQuiz(response.data.dataBT);
//         setDiem(response.data.Diem)
//         settenbaithi(response.data.TenBaiThi)
//         settgthi(response.data.TgThi)
//         setSocauhoi(response.data.dataBT.length)

//       } else {
//         toast.error(response.data.message);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch quiz data!");
//       console.error("Error fetching user quizzes:", error);
//     }
//   };


//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;

//     // Thêm số 0 ở phía trước nếu cần
//     const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
//     const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

//     return `${formattedMinutes}:${formattedSeconds}`;
//   };

//   const handleQuizClick = (IDBaiThi, PassCode) => {
//     if (isAuthenticated === true) {
//       navigate(`/DoQuiz/${IDBaiThi}/${PassCode}`);
//     } else {
//       navigate(`/Login`);
//     }
//   }

//   return (
//     <>
// <div className="w-full h-full ">
//   <div className="root-component">
//     <div className="app-header-container-result">
//       <button className="btn-close" onClick={() => navigate("/")}>
//         <IoMdClose className="btn-close__icon" />
//       </button>
//     </div>

//     <div className="min-height nx">
//       <div className="themed screen-container nt">
//         <div className="main-section-title">
//           <p className="font-medium ">{tenbaithi}</p>
//         </div>

//         <div className="accuracy-info-second-row flex-view">
//           <div className="top-section info-container ">
//             <div className="value-and-title-container flex-view flex-col">
//               <span className="info-title font-medium text-xs text-ds-light-300">
//                 Số câu
//               </span>
//               <span className="player-rank">{socauhoi}</span>
//             </div>
//           </div>
//           <div className="space"></div>

//           <div className="top-section info-container flex-view">
//             <div className="value-and-title-container flex-view flex-col">
//               <span className="info-title font-medium text-xs text-ds-light-300">
//                 Tổng điểm
//               </span>
//               <span className="player-score">{diem * socauhoi}</span>
//             </div>
//           </div>

//           <div className="top-section info-container flex-view">
//             <div className="value-and-title-container flex-view flex-col">
//               <span className="info-title font-medium text-xs text-ds-light-300">
//                 Thời gian
//               </span>
//               <span className="player-score">{formatTime(tgthi * socauhoi)}</span>
//             </div>
//           </div>
//         </div>

//         <div className="actions-container mb-10">
//           <button type="button" className="primary-action-btn mb-3" onClick={() => handleQuizClick(IDBaiThi, PassCode)}>
//             Làm bài ngay
//           </button>
//         </div>
//       </div>
//     </div>
//   </div>
// </div>
//     </>
//   );
// };

// export default Waiting;


import io from 'socket.io-client';
import { img, GetOneQuiz, port } from "../../services/apiUser";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from "react-toastify";

import { CiClock1 } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
const socket = io(port);

const Waiting = () => {
  const [queueCount, setQueueCount] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [tenbaithi, settenbaithi] = useState("");
  const [diem, setDiem] = useState("");
  const [socauhoi, setSocauhoi] = useState("");
  const [tgthi, settgthi] = useState("");

  const params = useParams();
  const navigate = useNavigate();
  const IDBaiThi = params.IDBaiThi;
  const PassCode = params.PassCode;
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  const token = localStorage.getItem("token");
  const IDUser = localStorage.getItem("IDUser");
  const [isHost, setIsHost] = useState(false); // Biến lưu trạng thái là chủ bài thi


  const getOneQuiz = async () => {
    try {
      const response = await GetOneQuiz(IDBaiThi, PassCode, token);
      if (response.status === 200) {
        settenbaithi(response.data.TenBaiThi)
        setDiem(response.data.Diem)
        settgthi(response.data.TgThi)
        setSocauhoi(response.data.dataBT.length)
        if (parseInt(response.data.IDUser) === parseInt(IDUser)) {
          setIsHost(true); // Người dùng là chủ bài thi
        }

      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      // toast.error("Failed to fetch quiz data!");
      console.error("Error fetching user quizzes:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Thêm số 0 ở phía trước nếu cần
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    getOneQuiz();
    // Kết nối vào phòng chờ
    socket.emit('joinWaitingRoom', { IDBaiThi, IDUser });

    // Lắng nghe sự kiện cập nhật số lượng người tham gia
    socket.on('waitingRoomUpdate', ({ count }) => {
      setQueueCount(count - 1);
      console.log("Waiting room updated. Count:", count, IDUser);
    });

    // Lắng nghe sự kiện bắt đầu bài thi cho người tham gia
    socket.on('examStarted', () => {
      console.log('Exam started event received');
      if (!isHost) {
        console.log('helo')
        navigate(`/DoQuiz/${IDBaiThi}/${PassCode}`);
        setExamStarted(true);
      }
    });

    return () => {
      socket.off('waitingRoomUpdate');
      socket.off('examStarted');
    };

  }, [IDBaiThi, PassCode, IDUser, token, navigate]);

  const handleStartExam = () => {
    if (isHost) {
      // Host is redirected to the results page
      console.log("Host is starting the exam...");
      socket.emit('startExam', IDBaiThi);
      navigate(`/QuizResults/${IDBaiThi}/${PassCode}`);
    }
  };

  // Hàm xử lý khi chủ bài thi nhấn "Bắt đầu thi"
  // const handleStartExam = () => {
  //   socket.emit('startExam', IDBaiThi);
  // };


  const handleClose = () => {
    socket.emit('leaveRoom', { IDBaiThi, IDUser });
    navigate("/"); // Điều hướng người dùng về trang khác
  };


  return (
    <>
      <div className="w-full h-full">
        <div className="root-component">
          <div className="app-header-container-result">
            <button className="btn-close" onClick={handleClose}>
            <IoMdClose className="btn-close__icon" />
            </button>
          </div>

          <div className="min-height nx">
            <div className="themed screen-container nt">
              <div className="main-section-title">
                <p className="font-medium">{tenbaithi}</p>
              </div>

              <div className="accuracy-info-second-row flex-view">
                <div className="top-section info-container ">
                  <div className="value-and-title-container flex-view flex-col">
                    <span className="info-title font-medium text-xs text-ds-light-300">
                      Số câu
                    </span>
                    <span className="player-rank">{socauhoi}</span>
                  </div>
                </div>
                <div className="space"></div>

                <div className="top-section info-container flex-view">
                  <div className="value-and-title-container flex-view flex-col">
                    <span className="info-title font-medium text-xs text-ds-light-300">
                      Tổng điểm
                    </span>
                    <span className="player-score">{diem * socauhoi}</span>
                  </div>
                </div>
              </div>
              <div className="accuracy-info-second-row flex-view">
                <div className="top-section info-container flex-view">
                  <div className="value-and-title-container flex-view flex-col">
                    <span className="info-title font-medium text-xs text-ds-light-300">
                      Thời gian / câu
                    </span>
                    <span className="player-score">{formatTime(tgthi)}</span>
                  </div>
                </div>
              </div>
              <div className="accuracy-info-second-row flex-view">
                <div className="top-section info-container">
                  <div className="value-and-title-container flex-view flex-col">
                    <span className="info-title font-medium">Số người tham gia</span>
                    <span className="player-rank">{queueCount}</span>
                  </div>
                </div>
              </div>

              {isHost && (
                <div className="actions-container mb-10">
                  <button type="button" className="primary-action-btn mb-3" onClick={handleStartExam}>
                    Bắt đầu thi
                  </button>
                </div>
              )}

              {!isHost && (
                <div className="actions-container mb-10">
                  <p>Đang chờ chủ bài thi bắt đầu...</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div >
    </>
  );
};

export default Waiting;
