import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {DeleteUser} from "../../../../services/apiService"
import { toast } from 'react-toastify';

const ModalDelete = (props) => {
  const {show, setShow, dataDelete} = props;
  const handleClose = () => setShow(false);
  const handleSubmitDlt = async () => {
    try {
      let res = await DeleteUser(dataDelete.IDUser)
      if(res.status === 200) {
        handleClose();
        toast.success(res.data.message)
        props.setcurrentPage(1);
        await props.LayDSUser(1, 3, "");
      }
    } catch (error) {
      console.log(error)
      if(error.status === 500) {
        toast.error(error.data.message)
      } else {
        toast.error("Có lỗi khi xóa 1!")
      }
    }
  }
  return (
    <>
      <Modal show={show} onHide={handleClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn chắn muốn xóa tài khoản <b>{dataDelete && dataDelete.NameUser ? dataDelete.NameUser : ""}</b>?</Modal.Body>
        <Modal.Footer>
          <Button className="btn btn-danger" onClick={handleClose}>
            Hủy
          </Button>
          <Button className="btn btn-success" onClick={() => handleSubmitDlt()}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalDelete;