import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { DeleteQuiz } from "../../../../services/apiService"
import { toast } from 'react-toastify';
import "../../../../assets/scss/Modal.scss"

const ModalDeleteQuiz = (props) => {
  const { show, setShow, dataDelete } = props;

  const handleClose = () => setShow(false);

  const handleSubmitDlt = async () => {
    console.log(dataDelete.IDBaiThi)
    try {
      let res = await DeleteQuiz(dataDelete.IDBaiThi, dataDelete.PassCode)
      if (res.status === 200) {
        handleClose();
        toast.success(res.data.message)
        props.setcurrentPage(1);
        await props.LayDSCauHoi(1, 3, "");
      }
    } catch (error) {
      console.log(error)
      if (error.status === 500) {
        toast.error(error.data.message)
      } else {
        toast.error("Có lỗi khi xóa!")
      }
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắn muốn xóa bài thi <b>{dataDelete && dataDelete.TenBaiThi ? dataDelete.TenBaiThi : ""}</b>?</Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-danger" onClick={handleClose}>
            Hủy
          </Button>
          <Button className="btn btn-success" onClick={() => handleSubmitDlt()}>
            Xóa vĩnh viễn
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDeleteQuiz;