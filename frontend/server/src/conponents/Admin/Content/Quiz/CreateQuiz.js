import { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock,
    faCheck,
    faTrash,
    faPlus,
    faImage,
    faChevronLeft,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "../../../../assets/scss/Create.scss";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import QuillEditor from '../../../QuillEditor';
import { port } from "../../../../services/apiService";


const Test1 = (props) => {
    const token = localStorage.getItem("token");
    const IDUser = localStorage.getItem("IDUser");
    useEffect(() => { }, [token, IDUser]);

    console.log(IDUser, "iduser");
    const [data, setData] = useState([
        {
            bigBox: "",
            smallBoxes: [
                { text: "", isSelected: false, image: null },
                { text: "", isSelected: false, image: null },
                { text: "", isSelected: false, image: null },
                { text: "", isSelected: false, image: null },
            ],
            image: null, // Ảnh của câu hỏi lớn (bigBox)
        },
    ]);


    const handleImageUpload = (index) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const newData = [...data];
                newData[index].image = {
                    file: file,
                    preview: URL.createObjectURL(file),
                };
                setData(newData);
            }
        };
        input.click();
    };

    const [TenBaiThi, setTenBaiThi] = useState("");
    const [selectedTime, setSelectedTime] = useState("30s");
    const [selectedPoint, setSelectedPoint] = useState("1 điểm");
    const navigate = useNavigate();
    const [passcode, setPasscode] = useState(0);

    const handleChange = (e, index, boxIndex = null) => {
        const newData = [...data];
        if (boxIndex !== null) {
            newData[index].smallBoxes[boxIndex].text = e.target.value; // Cập nhật đúng thuộc tính text
        } else {
            newData[index].bigBox = e.target.value; // Nếu không có boxIndex, cập nhật bigBox
        }
        setData(newData);
    };

    // const handleChangeBigBox = (e, index) => {
    //     const { value } = e.target;
    //     const newData = [...data];
    //     newData[index] = {
    //         ...newData[index],
    //         bigBox: value,
    //     };
    //     setData(newData);
    // };

    const handleChangeBigBox = (value, index) => {
        const newData = [...data];
        newData[index] = {
            ...newData[index],
            bigBox: value,
        };
        setData(newData);
    };


    const handleAddSmallBox = (index) => {
        const newData = [...data];
        newData[index].smallBoxes.push({ text: "", isSelected: false, image: null });
        setData(newData);
    };

    const handleUploadSmallBoxImage = (wrapperIndex, boxIndex) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const newData = [...data];
                newData[wrapperIndex].smallBoxes[boxIndex].image = {
                    file: file, // Tệp ảnh gốc
                    preview: URL.createObjectURL(file), // URL xem trước ảnh
                };
                setData(newData);
            }
        };

        input.click();
    };

    const handleAdd = () => {
        setData([
            ...data,
            {
                bigBox: "",
                smallBoxes: [
                    { text: "", isSelected: false },
                    { text: "", isSelected: false },
                    { text: "", isSelected: false },
                    { text: "", isSelected: false },
                ],
            },
        ]);
    };

    const handleTimeChange = (e) => {
        setSelectedTime(e.target.value);
    };

    const handlePointChange = (e) => {
        setSelectedPoint(e.target.value);
    };

    const handleDelete = (index) => {
        const updatedData = data.filter((_, i) => i !== index);
        setData(updatedData);
    };

    const handleDeleteSmallBox = (wrapperIndex, smallBoxIndex) => {
        const newData = [...data];
        newData[wrapperIndex].smallBoxes.splice(smallBoxIndex, 1);
        setData(newData);
    };

    const handleDeleteSmallBoxImage = (wrapperIndex, boxIndex) => {
        const newData = [...data];
        newData[wrapperIndex].smallBoxes[boxIndex].image = null;
        setData(newData);
    };


    const handleDeleteImage = (index) => {
        const newData = [...data];
        newData[index].image = null;
        setData(newData);
    };

    const handleToggleSelect = (wrapperIndex, smallBoxIndex) => {
        const newData = [...data];
        const selectedBox = newData[wrapperIndex].smallBoxes[smallBoxIndex];

        // Kiểm tra nếu đáp án được chọn không rỗng hoặc có ảnh
        if (
            selectedBox.text.trim() !== "" ||
            selectedBox.image // Kiểm tra nếu có ảnh
        ) {
            newData[wrapperIndex].smallBoxes = newData[wrapperIndex].smallBoxes.map(
                (box, index) => ({
                    ...box,
                    isSelected: index === smallBoxIndex,
                })
            );
            setData(newData);
        } else {
            toast.warning(
                "Không thể chọn đáp án rỗng làm đáp án đúng. Vui lòng nhập dữ liệu vào ô đáp án hoặc tải lên ảnh."
            );
        }
    };


    const [fileName, setFileName] = useState("");
    const [file1, setFile] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
    };

    const handleShowPreview = () => {
        setShowPreview(true);
    };

    const handleDeleteImageAnhBaiThi = () => {
        setFile(null);
        setFileName("");
        setShowPreview(false);
    };

    const handleSaveQuiz = async () => {
        // Kiểm tra xem có câu hỏi nào bị bỏ trống không
        for (let i = 0; i < data.length; i++) {
            if (!data[i].bigBox.trim()) {
                toast.warning(`Vui lòng nhập câu hỏi ở câu ${i + 1}`);
                return;
            }

            // Kiểm tra tất cả các ô trả lời (smallBoxes) xem có rỗng không
            for (let j = 0; j < data[i].smallBoxes.length; j++) {
                const smallBox = data[i].smallBoxes[j];

                // Nếu không có ảnh và không có nội dung text, báo lỗi
                if (!smallBox.image && (!smallBox.text || !smallBox.text.trim())) {
                    toast.warning(
                        `Vui lòng nhập nội dung cho đáp án ở câu ${i + 1}, đáp án ${j + 1}`
                    );
                    return;
                }
            }
            // Kiểm tra xem có ít nhất 2 câu trả lời được nhập hay không
            const validAnswers = data[i].smallBoxes.filter(
                (box) => box.text.trim() !== "" || box.image
            );
            if (validAnswers.length < 2) {
                toast.warning(`Vui lòng nhập ít nhất 2 câu trả lời cho câu ${i + 1}`);
                return;
            }

            // Kiểm tra xem có ít nhất một câu trả lời được chọn hay không
            const hasSelectedAnswer = data[i].smallBoxes.some(
                (box) => box.isSelected
            );
            if (!hasSelectedAnswer) {
                toast.warning(`Vui lòng chọn đáp án đúng cho câu ${i + 1}`);
                return;
            }
        }

        const DSCauHoi = data.map((item) => ({
            IDNoiDung: uuidv4(),
            CauHoi: item.bigBox,
            CauTraLoi: item.smallBoxes.map((smallBox) => {
                const idDapAn = uuidv4(); // Tạo IDDapAn tại đây
                smallBox.IDDapAn = idDapAn; // Gán IDDapAn vào smallBox
                return {
                    IDDapAn: idDapAn,
                    DapAn: smallBox.text || "",
                    Dung: smallBox.isSelected ? 1 : 0,
                    AnhCauTraLoi: smallBox.image ? smallBox.image.file.name : "",
                };
            }),
            AnhCauHoi: item.image ? item.image.file.name : "",
        }));


        console.log(DSCauHoi, "dsch");
        console.log(data, "Current data");

        const formData = new FormData();
        formData.append("TenBaiThi", TenBaiThi);
        formData.append("selectedTime", selectedTime);
        formData.append("selectedPoint", selectedPoint);
        formData.append("IDUser", IDUser);
        formData.append("TTPassCode", passcode);
        formData.append("DSCauHoi", JSON.stringify(DSCauHoi));

        DSCauHoi.forEach((item, index) => {
            if (data[index].image) {
                try {
                    formData.append(`AnhCauHoi-${item.IDNoiDung}`, data[index].image.file);
                    console.log(data[index].image.file, "ảnh");
                    console.log(item.IDNoiDung, "item.IDNoiDung");
                } catch (err) {
                    console.error(`Lỗi upload ảnh câu hỏi cho IDNoiDung ${item.IDNoiDung}:`, err);
                }
                // formData.append(`AnhCauHoi-${item.IDNoiDung}`, data[index].image.file);
            }

            data[index].smallBoxes.forEach((smallBox) => {
                if (smallBox.image) {
                    try {
                        formData.append(`AnhCauTraLoi-${smallBox.IDDapAn}`, smallBox.image.file);
                        console.log(smallBox.image.file, "ảnh câu trả lời");
                        console.log(smallBox.IDDapAn, "item.IDDapAn");
                    } catch (err) {
                        console.error(`Lỗi upload ảnh câu trả lời IDDapAn ${smallBox.IDDapAn}:`, err);
                    }
                    // formData.append(`AnhCauTraLoi-${smallBox.IDDapAn}`, smallBox.image.file);
                }
            });

        });

        if (file1) {
            formData.append("AnhBaiThi", file1); // Gửi cả tệp ảnh thay vì chỉ tên tệp
        }

        console.log(file1, "fileanh");

        if (!TenBaiThi) {
            toast.warning("Nhập tên bài thi");
            return;
        }

        if (!selectedTime) {
            toast.warning("Chọn thời gian cho từng câu hỏi!");
            return;
        }

        if (!selectedPoint) {
            toast.warning("Chọn điểm cho từng câu hỏi!");
            return;
        }

        try {
            // const response = await axios.post(
            //   "http://localhost:8080/api/admin/addQuestions",
            //   formData,
            //   {
            //     headers: {
            //       "Content-Type": "multipart/form-data",
            //       Authorization: `Bearer ${token}`, // Sử dụng token nếu cần
            //     },
            //   }
            // );

            const response = await axios.post(
                `${port}/api/admin/addQuestions`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`, // Sử dụng token nếu cần
                    },
                }
            );

            console.log("Response1:", response);
            console.log("formData:", formData);
            console.log("Response:", response.success);

            if (response.success) {
                toast.success("Thêm bài thi thành công");
                setTimeout(() => {
                    navigate("/BaiThiCuaToi");
                }, 3000);
            } else {
                console.log("Unexpected response:", response);
                toast.error("Thêm bài thi thất bại");
            }
        } catch (error) {
            console.error("Lỗi khi thêm bài thi:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };

    const styles = {
        pagecontainer: {
            marginTop: "100px",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingBottom: "110px",
        },

        container: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            height: "100%",
            padding: "20px",
            boxSizing: "border-box",
        },

        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            // marginBottom: '10px',
            padding: "10px",
        },
        contentWrapper: {
            overflowY: "auto",
            paddingBottom: "20px",
        },

        footer: {
            position: "fixed", // Đảm bảo footer luôn ở cuối trang
            bottom: 0,
            left: 0,
            width: "100%",
            backgroundColor: "#f5f5f5",
            boxShadow: "0 -1px 10px rgba(0, 0, 0, 0.1)", // Tạo bóng cho footer
            padding: "5px",
            display: "flex",
            justifyContent: "center",
            zIndex: 1000, // Đảm bảo footer nằm trên tất cả các phần tử khác
        },
        inputContainer: {
            display: "flex",
            flexGrow: 1,
            marginRight: "20px",
        },
        input: {
            width: "100%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
        },

        dropdownContainer: {
            display: "flex",
            alignItems: "center",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            fontSize: "16px",
            marginRight: "20px",
            backgroundColor: "white",
            cursor: "pointer",
        },
        icon: {
            marginRight: "10px",
            fontSize: "16px",
        },
        dropdown: {
            border: "none",
            fontSize: "16px",
            backgroundColor: "transparent",
            cursor: "pointer",
        },
        addButton: {
            padding: "10px 20px",
            backgroundColor: "rgba(136, 84, 192, 1)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
        },
        wrapper: {
            backgroundColor: "rgba(70, 26, 66, 1)",
            padding: "20px",
            borderRadius: "15px",
            width: "100%",
            maxWidth: "1200px",
            boxSizing: "border-box",
            marginBottom: "20px",
            position: "relative",
        },
        deleteButton: {
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            cursor: "pointer",
        },

        deleteSmallButton: {
            position: "absolute",
            top: "10px",
            right: "50px",
            backgroundColor: "rgba(255, 255, 255, 0)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        },
        check: {
            position: "absolute",
            top: "6px",
            left: "4px",
            backgroundColor: "#09090980", // Màu mặc định khi chưa được chọn
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
        },

        textarea: {
            width: "100%",
            height: "85%",
            backgroundColor: "transparent",
            // border: '1px solid #ccc',
            border: "none",
            // borderRadius: '5px',
            padding: "10px", // Thêm padding để cải thiện bố cục
            boxSizing: "border-box",
            fontSize: "20px",
            textAlign: "left", // Căn trái để dễ đọc hơn
            resize: "none", // Không cho phép thay đổi kích thước
            textOverflow: "ellipsis",
            overflow: "auto", // Cho phép cuộn nếu văn bản quá dài
            whiteSpace: "pre-wrap", // Cho phép xuống hàng
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "normal",
            marginTop: "30px",
            outline: "none",
        },

        uploadImageButton: {
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            // zIndex: 1,  // Đảm bảo nút này nằm trên các phần tử khác
        },
        previewImage: {
            height: "100%",
            objectFit: "cover",
            display: "flex",
            justifyContent: "center",
            marginRight: "5px"
        },
        deleteImageButton: {
            position: "absolute",
            top: "-7px",
            right: "8px",
         
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            width: "30px",
            height: "30px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            // zIndex: 3, 
        },
        textareaWithImage: (hasImage) => ({
            width: hasImage ? "90%" : "100%",
            height: "100%",
            marginLeft: hasImage ? "15px" : "0",
            backgroundColor: "transparent",
            border: "1px solid #ccc",
            borderRadius: hasImage ? "10px 10px 10px 10px" : "10px",
            paddingLeft: "20px",
            paddingRight: "20px",
            boxSizing: "border-box",
            fontSize: "20px",
            textAlign: "center",
            resize: "none",
            textOverflow: "ellipsis",
            overflow: "auto", // Cho phép cuộn nếu văn bản quá dài
            whiteSpace: "pre-wrap", // Cho phép xuống hàng
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "normal",
            color: "white",
            padding: "20px",
        }),

        previousbutton: {
            backgroundColor: "transparent",
            color: "black",
            border: "1px solid #ccc",
            borderRadius: "",
            width: "40px",
            height: "3rem",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "10px",
        },
        questionNumber: {
            fontSize: "18px",
            fontWeight: "bold",
            marginBottom: "10px",
            textAlign: "left",
            color: "#333",
        },

        passcodeContainer: {
            display: "flex",
            alignItems: "center",
            marginRight: "20px",
        },
        label: {
            marginRight: "10px",
            fontSize: "16px",
        },
        radio: {
            marginRight: "5px",
        },
        radioLabel: {
            marginRight: "15px",
            fontSize: "16px",
        },
    };
    
    const [isInputVisible, setIsInputVisible] = useState(false); // Trạng thái hiển thị inputmheader
    const toggleInputVisibility = () => {
        setIsInputVisible(!isInputVisible); // Thay đổi trạng thái ẩn/hiện
    };

    return (
        <>
            <div className="laptopHeader">
                <div style={styles.header}>
                    <div>
                            <Link
                                to="/BaiThiCuaToi"
                                style={{ color: "inherit", textDecoration: "none" }}
                            >
                        <Button style={styles.previousbutton}>
                                <FontAwesomeIcon icon={faChevronLeft} />
                        </Button>
                            </Link>
                    </div>
                    <div style={styles.inputContainer}>
                        <input
                            type="text"
                            value={TenBaiThi}
                            onChange={(e) => setTenBaiThi(e.target.value)}
                            style={styles.input}
                            placeholder="Nhập tên bài thi"
                        />
                    </div>

                    <label style={styles.label}>Công khai</label>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="passcode"
                            id="passcode1"
                            value="1"
                            checked={passcode === 1}
                            onChange={() => setPasscode(1)}
                        />
                        <label className="form-check-label" htmlFor="passcode1">
                            Không
                        </label>
                    </div>
                    <div className="form-check mx-2">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="passcode"
                            id="passcode2"
                            value="0"
                            checked={passcode === 0}
                            onChange={() => setPasscode(0)}
                        />
                        <label className="form-check-label" htmlFor="passcode2">
                            Có
                        </label>
                    </div>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div style={styles.dropdownContainer}>
                            <FontAwesomeIcon icon={faClock} style={styles.icon} />
                            <select
                                style={styles.dropdown}
                                value={selectedTime}
                                onChange={handleTimeChange}
                            >
                                <option value="30">30 giây</option>
                                <option value="60">1 phút</option>
                                <option value="90">1 phút 30 giây</option>
                                <option value="120">2 phút</option>
                                <option value="180">3 phút</option>
                            </select>
                        </div>

                        <div style={styles.dropdownContainer}>
                            <FontAwesomeIcon icon={faCheck} style={styles.icon} />
                            <select
                                style={styles.dropdown}
                                value={selectedPoint}
                                onChange={handlePointChange}
                            >
                                <option value="1">1 điểm</option>
                                <option value="2">2 điểm</option>
                                <option value="3">3 điểm</option>
                                <option value="4">4 điểm</option>
                                <option value="5">5 điểm</option>
                                <option value="6">6 điểm</option>
                                <option value="7">7 điểm</option>
                                <option value="8">8 điểm</option>
                                <option value="9">9 điểm</option>
                                <option value="10">10 điểm</option>
                            </select>
                        </div>
                        <Button style={styles.addButton} onClick={handleAdd}>
                            Thêm
                        </Button>
                    </div>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <label style={{ marginLeft: "10px" }}>Ảnh Bài Thi: </label>
                    <button
                        type="button"
                        className="btn btn-outline-secondary mx-2"
                        onClick={() => document.getElementById("fileInput").click()}
                    >
                        Tải ảnh lên
                    </button>
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                    />
                    {fileName && (
                        <span
                            style={{ cursor: "pointer", fontWeight: "600" }}
                            onClick={handleShowPreview}
                        >
                            {fileName}
                        </span>
                    )}
                </div>
            </div>

            <div className="mobileHeader">
                <div className="mheader">
                    <div className="inputmheader">
                        <div>
                                <Link
                                    to="/BaiThiCuaToi"
                                    style={{ color: "inherit", textDecoration: "none" }}
                                >
                            <Button style={styles.previousbutton}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                            </Button>
                                </Link>
                        </div>

                        <div className="inputContainerMb">
                            <input
                                type="text"
                                value={TenBaiThi}
                                onChange={(e) => setTenBaiThi(e.target.value)}
                                className="inputMobile"
                                placeholder="Nhập tên bài thi"
                            />
                        </div>
                    </div>
                    {isInputVisible && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <label style={styles.label}>Công khai</label>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="passcode"
                                        id="passcode1"
                                        value="1"
                                        checked={passcode === 1}
                                        onChange={() => setPasscode(1)}
                                    />
                                    <label className="form-check-label" htmlFor="passcode1">
                                        Không
                                    </label>
                                </div>

                                <div className="form-check mx-2">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="passcode"
                                        id="passcode2"
                                        value="0"
                                        checked={passcode === 0}
                                        onChange={() => setPasscode(0)}
                                    />
                                    <label className="form-check-label" htmlFor="passcode2">
                                        Có
                                    </label>
                                </div>

                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <div className="dropdownContainerMb">
                                        <FontAwesomeIcon icon={faClock} style={styles.icon} />
                                        <select
                                            style={styles.dropdown}
                                            value={selectedTime}
                                            onChange={handleTimeChange}
                                        >


                                            <option value="30">30 giây</option>
                                            <option value="60">1 phút</option>
                                            <option value="90">1 phút 30 giây</option>
                                            <option value="120">2 phút</option>
                                            <option value="180">3 phút</option>
                                        </select>
                                    </div>

                                    <div className="dropdownContainerMb">
                                        <FontAwesomeIcon icon={faCheck} style={styles.icon} />
                                        <select
                                            style={styles.dropdown}
                                            value={selectedPoint}
                                            onChange={handlePointChange}
                                        >
                                            <option value="1">1 điểm</option>
                                            <option value="2">2 điểm</option>
                                            <option value="3">3 điểm</option>
                                            <option value="4">4 điểm</option>
                                            <option value="5">5 điểm</option>
                                            <option value="6">6 điểm</option>
                                            <option value="7">7 điểm</option>
                                            <option value="8">8 điểm</option>
                                            <option value="9">9 điểm</option>
                                            <option value="10">10 điểm</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <label style={{ marginLeft: "10px" }}>Ảnh Bài Thi: </label>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary mx-2"
                                        onClick={() => document.getElementById("fileInput").click()}
                                    >
                                        Tải ảnh lên
                                    </button>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleFileUpload}
                                    />
                                    {fileName && (
                                        <span
                                            style={{ cursor: "pointer", fontWeight: "600" }}
                                            onClick={handleShowPreview}
                                        >
                                            {fileName}
                                        </span>
                                    )}
                                </div>

                                <Button style={styles.addButton} onClick={handleAdd}>
                                    Thêm
                                </Button>
                            </div>
                        </>
                    )}

                    <div className="dropdownMenu">
                        <FontAwesomeIcon
                            icon={isInputVisible ? faChevronUp : faChevronDown}
                            onClick={toggleInputVisibility}
                            className="dropdownMenuIcon"
                            style={{ cursor: "pointer", fontSize: "20px" }}
                        />
                    </div>
                </div>
            </div>

            <div style={styles.pagecontainer}>
                <div style={styles.contentWrapper}>
                    <div style={styles.container}>
                        {data.map((item, index) => (
                            <div key={index} className="content-mb">
                                <div style={styles.questionNumber}> Câu {index + 1}</div>

                                <div key={index} style={styles.wrapper}>
                                    <button
                                        style={styles.deleteButton}
                                        onClick={() => handleDelete(index)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <div className="bigBox">
                                        <button
                                            style={styles.uploadImageButton}
                                            onClick={() => handleImageUpload(index)}
                                        >
                                            <FontAwesomeIcon icon={faImage} />
                                        </button>
                                        {item.image && (
                                            <div className="imageWrapper">
                                                <img
                                                    src={item.image.preview}
                                                    alt="Preview"
                                                    style={styles.previewImage}
                                                />
                                                <button
                                                    style={styles.deleteImageButton}
                                                    onClick={() => handleDeleteImage(index)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="quill">
                                            <QuillEditor
                                                value={item.bigBox} // Nội dung của câu hỏi
                                                onChange={(value) => handleChangeBigBox(value, index)} // Cập nhật câu hỏi tại index
                                            />
                                        </div>



                                    </div>

                                    <div className="smallBoxes">
                                        {item.smallBoxes?.map((smallBox, boxIndex) => (
                                            <div
                                                key={boxIndex}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    padding: "10px",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "10px",
                                                    position: "relative",
                                                    marginBottom: "10px",
                                                    marginLeft: "2px",
                                                    marginRight: "2px",
                                                    backgroundColor:
                                                        boxIndex === 0
                                                            ? "rgba(45, 112, 174, 1)"
                                                            : boxIndex === 1
                                                                ? "rgba(45, 157, 166, 1)"
                                                                : boxIndex === 2
                                                                    ? "rgba(239, 169, 41, 1)"
                                                                    : boxIndex === 3
                                                                        ? "rgba(213, 84, 109, 1)"
                                                                        : boxIndex === 4
                                                                            ? "rgba(154, 66, 146, 1)"
                                                                            : "#84D9C4",
                                                }}
                                            >
                                                {/* Nút xóa smallBox */}
                                                <button
                                                    style={{
                                                        position: "absolute",
                                                        top: "5px",
                                                        right: "5px",
                                                        backgroundColor: "red",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "50%",
                                                        padding: "5px",
                                                        cursor: "pointer",
                                                        width: "30px",
                                                        height: "32px",
                                                    }}
                                                    onClick={() => handleDeleteSmallBox?.(index, boxIndex)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>

                                                <button
                                                    style={{
                                                        ...(styles?.check || {}),
                                                        backgroundColor: smallBox.isSelected ? "green" : "#09090980",
                                                    }}
                                                    onClick={() => handleToggleSelect?.(index, boxIndex)}
                                                >
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>

                                                {/* Hiển thị nội dung smallBox */}
                                                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                                                    

                                                    {/* Textarea */}
                                                    <textarea
                                                        name={`smallBox${boxIndex}`}
                                                        value={smallBox.text || ""}
                                                        onChange={(e) => handleChange?.(e, index, boxIndex)}
                                                        placeholder="Nhập câu trả lời"
                                                        rows="3"
                                                        style={{
                                                            width: "100%",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "5px",
                                                            padding: "10px",
                                                            marginTop: "32px"
                                                            // marginTop: smallBox.image ? "10px" : "0",
                                                        }}
                                                    />
                                                </div>

                                                {/* Hiển thị ảnh */}
                                                {smallBox.image?.preview && (
                                                        <div
                                                            style={{
                                                                position: "relative",
                                                                width: "100%",
                                                                maxHeight: "80px",
                                                                overflow: "hidden",
                                                                display: "flex",
                                                                justifyContent: "center",
                                                                alignItems: "center",
                                                                marginTop: "10px",
                                                            }}
                                                        >
                                                            <img
                                                                src={smallBox.image.preview}
                                                                alt="Preview"
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "80px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "5px",
                                                                }}
                                                            />
                                                            <button
                                                                style={{
                                                                    position: "absolute",
                                                                    top: "0px",
                                                                    right: "5px",
                                                                    backgroundColor: "rgba(255, 0, 0, 0.8)",
                                                                    color: "#fff",
                                                                    border: "none",
                                                                    borderRadius: "50%",
                                                                    padding: "5px",
                                                                    cursor: "pointer",
                                                                    width: "30px",
                                                                    height: "32px",
                                                                }}
                                                                onClick={() => handleDeleteSmallBoxImage?.(index, boxIndex)}
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} />
                                                            </button>
                                                        </div>
                                                    )}

                                                {/* Nút tải ảnh */}
                                                {!smallBox.image && (
                                                    <button
                                                        style={{
                                                            marginTop: "10px",
                                                            border: "1px dashed #ccc",
                                                            backgroundColor: "transparent",
                                                            cursor: "pointer",
                                                            color: "#666",
                                                            fontSize: "14px",
                                                            borderRadius: "5px",
                                                            padding: "5px",
                                                        }}
                                                        onClick={() => handleUploadSmallBoxImage?.(index, boxIndex)}
                                                    >
                                                        <FontAwesomeIcon icon={faImage} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}


                                        <button
                                            className="addSmallBoxButton"
                                            onClick={() => handleAddSmallBox(index)}
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={styles.footer}>
                    <Button style={styles.addButton} onClick={handleSaveQuiz}>
                        Lưu
                    </Button>
                </div>
            </div>

            <Modal show={showPreview} onHide={handleClosePreview} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ color: "rgb(136, 84, 152)" }}>
                        Ảnh bìa bài thi
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: "center" }}>
                    {file1 && (
                        <img
                            src={URL.createObjectURL(file1)}
                            alt="Preview"
                            style={{ maxWidth: "100%", maxHeight: "400px" }}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        style={{ backgroundColor: "red" }}
                        onClick={handleDeleteImageAnhBaiThi}
                    >
                        Xoá
                    </Button>
                    <Button
                        style={{ backgroundColor: "rgb(136, 84, 192)" }}
                        onClick={handleClosePreview}
                    >
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </>
    );
};

export default Test1;
