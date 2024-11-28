import express from "express";
import http from 'http'; // Import HTTP module

const cors = require('cors');
require("dotenv").config();
const bodyParser = require("body-parser");
const Admin = require("./route/apiAdmin");
const User = require("./route/apiUser");

const app = express();

app.use(cors());
app.use(express.static("./src/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  next();
});

app.get("/", (req, res) => {
  return res.send("Hello World");
});

// Sử dụng route API
app.use("/api/user", User);
app.use("/api/admin", Admin);
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    },
});

// Data structure để quản lý phòng chờ và người tham gia
let waitingRooms = {};

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinWaitingRoom', ({ IDBaiThi, IDUser }) => {
    console.log(`User ${IDUser} joined room ${IDBaiThi}`);
    socket.userID = IDUser;
    socket.examID = IDBaiThi;

    // Nếu phòng chưa tồn tại, tạo phòng mới với host là người dùng hiện tại
    if (!waitingRooms[IDBaiThi]) {
      waitingRooms[IDBaiThi] = { users: [], host: IDUser };
    }

    // Kiểm tra nếu người dùng chưa có trong danh sách thì mới thêm
    if (!waitingRooms[IDBaiThi].users.includes(IDUser)) {
      waitingRooms[IDBaiThi].users.push(IDUser);
    }

    // Thêm người dùng vào phòng qua socket
    socket.join(IDBaiThi);

    // Gửi lại danh sách người tham gia cho tất cả người dùng trong phòng
    io.to(IDBaiThi).emit('waitingRoomUpdate', {
      count: waitingRooms[IDBaiThi].users.length,
    });

    console.log('Waiting room updated:', waitingRooms[IDBaiThi]);
  });



  // Khi chủ bài thi bắt đầu bài thi
  socket.on('startExam', (IDBaiThi) => {
    console.log('Exam started for:', IDBaiThi); // Kiểm tra sự kiện phát đi
    const room = waitingRooms[IDBaiThi];
    if (room && room.host === socket.userID) {
      console.log(`Sending examStarted to room ${IDBaiThi}`);
      io.to(IDBaiThi).emit('examStarted');
    } else {
      console.log('Room not found or user is not the host');
    }
  });

  // Khi người dùng nộp bài
  socket.on('userSubmittedQuiz', ({ IDBaiThi, IDUser, userResults }) => {
    console.log(`${IDUser} đã nộp bài cho phòng ${IDBaiThi}`);
    const room = waitingRooms[IDBaiThi]; // Kiểm tra xem phòng có tồn tại không
    console.log(room, 'room')
    if (room) {
      // Phát sự kiện tới tất cả người trong phòng, bao gồm cả chủ bài thi
      io.to(IDBaiThi).emit('userSubmittedQuiz', userResults);
      console.log(userResults, 'userResults')
    } else {
      console.log('Phòng thi không tồn tại.');
    }

    console.log(waitingRooms, 'waitingRooms checknopbai')
  });

  socket.on('leaveRoom', ({ IDBaiThi, IDUser }, callback) => {
    const { examID, userID } = socket;
    console.log(examID, userID, IDBaiThi, IDUser, 'kiem tra roi phong');


    // Kiểm tra nếu phòng và người dùng còn tồn tại
    if (examID && userID && waitingRooms[examID]) {
      // Xóa người dùng khỏi danh sách users trong phòng
      waitingRooms[examID].users = waitingRooms[examID].users.filter(id => id !== userID);

      // Cập nhật lại số người tham gia cho phòng hiện tại
      io.to(examID).emit('waitingRoomUpdate', {
        count: waitingRooms[examID].users.length,
      });

      console.log(waitingRooms[examID].users.length, 'người còn trong phòng')
      console.log(waitingRooms, 'waitingRooms check roi phong chua xoá')

      // Nếu phòng không còn người dùng nào, xóa phòng đó
      if (waitingRooms[examID].users.length === 0 || waitingRooms[examID].host == userID) {
        delete waitingRooms[examID];
        socket.leaveAll();
        console.log(examID, 'xoá phòng examID')
      }
      console.log(`User ${userID} rời phòng ${examID}`);
      // Xác nhận rời phòng thành công
      if (callback) callback();
      console.log(`User ${userID} đã rời phòng ${examID}`);

      console.log(waitingRooms, 'waitingRooms check roi phong')

    }
    console.log(waitingRooms, 'waitingRooms check roi phong')
  });

});

// Khởi động server
// const port = process.env.PORT || 3000;
// server.listen(port, () => console.log(`Server chạy tại http://localhost:${port}`));

const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  // console.log(`Server chạy tại http://0.0.0.0:${port} hoặc http://192.168.2.9:${port}`);
  console.log(`Server chạy tại http://0.0.0.0:${port} hoặc http://10.10.38.32:8080`);

});