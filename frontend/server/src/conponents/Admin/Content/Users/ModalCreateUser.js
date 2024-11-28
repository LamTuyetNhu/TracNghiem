import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import axios from "axios";
import { port } from "../../../../configs/config";

const ModalCreateUser = (props) => {
  const { show, setShow } = props;

  const handleClose = () => {
    setShow(false);
    setEmail("");
    setName("");
    setRole("user");
    setPassword("");
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const CreateUser = async (event) => {
    event.preventDefault();

    const isValidEmail = validateEmail(email);
    if (!isValidEmail) {
      toast.warning("Email không hợp lệ!");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password có ít nhất 6 ký tự!");
      return;
    }

    if (!name) {
      toast.warning("Nhập tên của bạn!");
      return;
    }

    if (!role) {
      toast.warning("Chọn quyền truy cập!");
      return;
    }

    
    try {
      let response = await axios.post(`${port}/api/admin/addUser`, {
        name,
        email,
        password,
        role,
      });
    
      console.log('Response from backend:', response);
    
      if (response.success) {
        handleClose();
        toast.success(response.message);
        props.setcurrentPage(1);
        await props.LayDSUser(1, 3, "");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error('Error while adding user:', error);
      toast.error("Lỗi thêm mới!");
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Thêm người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="user">User</option>
                <option value="ctv">CTV</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-danger" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            className="btn btn-success"
            onClick={(event) => CreateUser(event)}
          >
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalCreateUser;
