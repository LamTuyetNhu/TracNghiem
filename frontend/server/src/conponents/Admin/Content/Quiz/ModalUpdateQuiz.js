import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import axios from "axios";
import { linkUpdateQuiz, DisableQuiz } from "../../../../services/apiService";
import "../../../../assets/scss/Modal.scss";

const ModalUpdateQuiz = (props) => {
  const { show, setShow, dataUpdate } = props;

  const handleClose = () => {
    setShow(false);
  };

  const [TenBaiThi, setTenBaiThi] = useState("");
  const [TenTacGia, setTenTacGia] = useState("");
  const [NgayBatDau, setNgayBatDau] = useState("");
  const [NgayKetThuc, setNgayKetThuc] = useState("");
  const [isDisable, setIsDisable] = useState(false);
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    if (dataUpdate) {
      setTenBaiThi(dataUpdate.TenBaiThi || "");
      setTenTacGia(dataUpdate.TgThi || "");
      setNgayBatDau(dataUpdate.TgBatDau ? formatDate(dataUpdate.TgBatDau) : "");
      setNgayKetThuc(
        dataUpdate.TgKetThuc ? formatDate(dataUpdate.TgKetThuc) : ""
      );
    }
  }, [dataUpdate]);

  const UpdateQuiz = async (event) => {
    event.preventDefault();

    if (!TenBaiThi) {
      toast.warning("Nhập tên bài thi");
      return;
    }

    if (!TenTacGia) {
      toast.warning("Nhập thời gian thi!");
      return;
    }

    if (!NgayBatDau) {
      toast.warning("Nhập ngày bắt đầu!");
      return;
    }

    if (!NgayKetThuc) {
      toast.warning("Nhập ngày kết thúc!");
      return;
    }

    if (NgayKetThuc < NgayBatDau) {
      toast.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      return;
    }
    console.log("=>: ", TenBaiThi, TenTacGia, NgayBatDau, NgayKetThuc);
    try {
      let response = await axios.post(
        linkUpdateQuiz + `/${dataUpdate.IDBaiThi}`,
        {
          TenBaiThi,
          TenTacGia,
          NgayBatDau,
          NgayKetThuc,
        }
      );

      console.log("Response from backend:", response);

      if (response.success) {
        handleClose();
        toast.success(response.message);
        props.setcurrentPage(1);
        await props.LayDSCauHoi(1, 3, "");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error while updating quiz:", error);
      toast.error("Lỗi cập nhật!");
    }
  };

  const handleDisabe = async (event) => {
    try {
      let response = await DisableQuiz(dataUpdate.IDBaiThi);
      if (response.status === 200) {
        handleClose();
        toast.success(response.data.message);
        props.setcurrentPage(1);
        await props.LayDSCauHoi(1, 3, "");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error while updating quiz:", error);
      toast.error("Lỗi vô hiệu hóa!");
    }
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật bài thi</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Tên bài thi</label>
              <input
                type="text"
                className="form-control"
                value={TenBaiThi}
                onChange={(event) => setTenBaiThi(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Thời gian thi</label>
              <input
                type="number"
                className="form-control"
                value={TenTacGia}
                onChange={(event) => setTenTacGia(event.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Ngày bắt đầu</label>
              <div className="form-control form-label__date ">
                <p>{NgayBatDau}</p>
                <input
                  type="date"
                  className="form-control__item"
                  onChange={(event) =>
                    setNgayBatDau(formatDate(event.target.value))
                  }
                />
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label">Ngày kết thúc</label>
              <div className="form-control form-label__date ">
                <p>{NgayKetThuc}</p>
                <input
                  type="date"
                  className="form-control__item"
                  onChange={(event) =>
                    setNgayKetThuc(formatDate(event.target.value))
                  }
                />
              </div>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-danger" onClick={handleClose}>
            Hủy
          </Button>
          <Button className="btn btn-warning" onClick={handleDisabe}>
            {dataUpdate.TTBaiThi !== 0 ? "Tạm ẩn" : "Mở lại"}
          </Button>
          <Button
            className="btn btn-success"
            onClick={(event) => UpdateQuiz(event)}
          >
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ModalUpdateQuiz;
