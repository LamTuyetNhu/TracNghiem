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
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "../../../../assets/scss/Create.scss";
import jsPDF from 'jspdf';
import RobotoRegular from "../../../../assets/font/Roboto-Regular-normal.js";
import { port } from "../../../../services/apiService.js";
import QuillEditor from '../../../QuillEditor';
import { convert } from 'html-to-text';

const TestUpdate = (props) => {
    const { IDBaiThi } = useParams();
    useEffect(() => {
        fetchQuizData(IDBaiThi);
    }, [IDBaiThi]);

    const token = localStorage.getItem("token");
    const IDUser = localStorage.getItem("IDUser");
    useEffect(() => { }, [token, IDUser]);

    console.log(IDUser, "iduser");
    const [data, setData] = useState([
        {
            bigBox: "",
            smallBoxes: [
                { text: "", isSelected: false },
                { text: "", isSelected: false },
                { text: "", isSelected: false },
                { text: "", isSelected: false },
            ],
            image: null,
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
    const [passcode, setPasscode] = useState("");

    const handleChange = (e, index, boxIndex = null) => {
        const newData = [...data];
        if (boxIndex !== null) {
            newData[index].smallBoxes[boxIndex].text = e.target.value; // Cập nhật đúng thuộc tính text
        } else {
            newData[index].bigBox = e.target.value; // Nếu không có boxIndex, cập nhật bigBox
        }
        setData(newData);
    };

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
        newData[index].smallBoxes.push({ text: "", isSelected: false }); // Thêm smallBox với trạng thái mặc định
        setData(newData);
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

    const handleDeleteImage = (index) => {
        const newData = [...data];
        newData[index].image = null;
        setData(newData);
    };

    const handleToggleSelect = (wrapperIndex, smallBoxIndex) => {
        const newData = [...data];

        // Kiểm tra nếu đáp án được chọn không rỗng
        if (newData[wrapperIndex].smallBoxes[smallBoxIndex].text.trim() !== "") {
            newData[wrapperIndex].smallBoxes = newData[wrapperIndex].smallBoxes.map(
                (box, index) => ({
                    ...box,
                    isSelected: index === smallBoxIndex,
                })
            );
            setData(newData);
        } else {
            toast.warning(
                "Không thể chọn đáp án rỗng làm đáp án đúng. Vui lòng nhập dữ liệu vào ô đáp án."
            );
        }
    };

    const [fileName, setFileName] = useState('');
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
    const handleDeleteSmallBoxImage = (wrapperIndex, boxIndex) => {
        const newData = [...data];
        newData[wrapperIndex].smallBoxes[boxIndex].image = null;
        setData(newData);
    };


    const fetchQuizData = async (IDBaiThi) => {
        try {
            const response = await axios.get(`${port}/api/admin/question/${IDBaiThi}`);

            console.log(response, "response");

            // Kiểm tra nếu request thành công
            if (response && response.data && response.data.success) {
                console.log("thanh cong");
                console.log(response.data.dataBT, "quizData");
                const quizData = response.data.dataBT;

                const quiz = response.data.BT;
                // Gán dữ liệu cho các state tương ứng
                setPasscode(Number(quiz[0].TTPassCode));
                setTenBaiThi(quiz[0].TenBaiThi || "");
                setSelectedTime(quiz[0].TgThi || "");
                setSelectedPoint(quiz[0].Diem || "");

                if (quiz[0].AnhBaiThi) {
                    setFileName(quiz[0].AnhBaiThi);
                    setFile(`${port}/images/${quiz[0].AnhBaiThi}`);

                }

                const formattedData = quizData.map((item) => ({
                    IDNoiDung: item.IDNoiDung,
                    bigBox: item.CauHoi,
                    smallBoxes: item.CauTraLoi.map((answer) => ({
                        IDDapAn: answer.IDDapAn,
                        text: answer.DapAn,
                        isSelected: answer.Dung === 1,
                        image: answer.AnhCauTraLoi
                            ? { file: null, preview: `${port}/images/${answer.AnhCauTraLoi}` }
                            : null,
                    })),

                    image: item.AnhCauHoi ? { file: null, preview: `${port}/images/${item.AnhCauHoi}` } : null

                }));

                setData(formattedData);
            } else {
                alert("Lấy nội dung bài thi không thành công!");
            }
        } catch (error) {
            console.error("Lỗi khi lấy nội dung bài thi:", error);
            alert("Lỗi khi lấy nội dung bài thi!");
        }
    };

    const handleUpdateQuiz = async () => {
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
                (box) => box.text.trim() !== ""
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
            IDNoiDung: item.IDNoiDung || uuidv4(), // Sử dụng IDNoiDung có sẵn
            CauHoi: item.bigBox,
            CauTraLoi: item.smallBoxes.map((smallBox) => ({
                IDDapAn: smallBox.IDDapAn || uuidv4(),
                DapAn: smallBox.text?.trim() || "",
                Dung: smallBox.isSelected ? 1 : 0,
                AnhCauTraLoi: smallBox.image?.file
                    ? smallBox.image.file.name
                    : smallBox.image?.preview.split("/").pop() || "",
            })),
            AnhCauHoi: item.image
                ? item.image.file?.name || item.image.preview.split("/").pop()
                : "",
        }));

        console.log(DSCauHoi, "dschupdate");
        console.log(data, "data");

        const formData = new FormData();
        formData.append("TenBaiThi", TenBaiThi);
        formData.append("selectedTime", selectedTime);
        formData.append("selectedPoint", selectedPoint);
        formData.append("passcode", passcode);
        formData.append("IDUser", IDUser);
        formData.append("DSCauHoi", JSON.stringify(DSCauHoi));

        DSCauHoi.forEach((item, index) => {
            if (data[index].image && data[index].image.file) {
                formData.append(`AnhCauHoi-${item.IDNoiDung}`, data[index].image.file);
            }

            item.CauTraLoi.forEach((answer, j) => {
                const answerImage = data[index].smallBoxes[j].image?.file;
                if (answerImage) {
                    formData.append(
                        `AnhCauTraLoi-${answer.IDDapAn}`, answerImage);
                    console.log(answer.IDDapAn, 'answer.IDDapAn')
                    console.log(answerImage, 'answerImage')
                }
            });
        });

        if (file1) {
            formData.append('AnhBaiThi', file1);
        }
        console.log(file1, 'file1')

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
            const response = await axios.post(
                // `http://localhost:8080/api/admin/updateQuiz/${IDBaiThi}`,
                `${port}/api/admin/updateQuiz/${IDBaiThi}`,

                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`, // Sử dụng token nếu cần
                    },
                }
            );
            console.log(response);

            if (response.success) {
                toast.success('Cập nhật bài thi thành công');
                setTimeout(() => {
                    // navigate('/CapNhatBaiThi');
                }, 3000);
                // navigate('/Admin');
            } else {
                toast.error('Cập nhật bài thi thất bại');
                console.log('Unexpected response:', response);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật bài thi:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        const marginLeft = 20;
        const pageWidth = doc.internal.pageSize.width - 30;
        const pageHeight = doc.internal.pageSize.height;
        let currentHeight = 20;
        const totalScore = selectedPoint * data.length;

        // Thêm font Roboto
        doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
        doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        doc.setFont("Roboto");

        // Nội dung đầu trang
        doc.setFontSize(18);
        doc.text(`Bài Thi: ${TenBaiThi}`, marginLeft, currentHeight);
        currentHeight += 10;

        doc.setFontSize(14);
        doc.text(`Thời gian: ${selectedTime} phút`, marginLeft, currentHeight);
        currentHeight += 10;

        doc.text(`Điểm tối đa: ${totalScore} điểm`, marginLeft, currentHeight);
        currentHeight += 20;

        for (const [index, question] of data.entries()) {
            // Kiểm tra nếu cần thêm trang mới
            if (currentHeight + 20 > pageHeight) {
                doc.addPage();
                currentHeight = 20;
            }

            // Xử lý câu hỏi
            const plainTextQuestion = convert(question.bigBox, {
                wordwrap: false,
            }).replace(/\n+/g, "\n");
            const lines = plainTextQuestion.split("\n");

            doc.setFontSize(12);
            doc.text(`Câu ${index + 1}:`, marginLeft, currentHeight);
            currentHeight += 10;

            for (const line of lines) {
                const splitText = doc.splitTextToSize(line, pageWidth);
                splitText.forEach((part) => {
                    doc.text(part.trim(), marginLeft, currentHeight);
                    currentHeight += 10;

                    if (currentHeight + 10 > pageHeight) {
                        doc.addPage();
                        currentHeight = 20;
                    }
                });
            }

            // Thêm ảnh nếu có
            if (question.image && question.image.preview) {
                const imgData = question.image.preview.startsWith("data:image")
                    ? question.image.preview
                    : await convertImageToDataURL(question.image.preview);

                if (imgData) {
                    // Kích thước ảnh
                    const imgWidth = 100;
                    const imgHeight = 80;

                    // Tính toán vị trí căn giữa
                    const xPosition = (pageWidth - imgWidth) / 2; // Căn giữa theo chiều ngang

                    // Thêm ảnh vào PDF
                    doc.addImage(imgData, "PNG", xPosition, currentHeight, imgWidth, imgHeight);
                    currentHeight += imgHeight + 10; // Khoảng cách sau ảnh

                    // Kiểm tra nếu ảnh chiếm hết không gian trang
                    if (currentHeight + 10 > pageHeight) {
                        doc.addPage();
                        currentHeight = 20;
                    }
                }
            }


            // Xử lý từng câu trả lời
            for (const [answerIndex, answer] of question.smallBoxes.entries()) {
                const optionLetter = String.fromCharCode(65 + answerIndex); // (A), (B),...
                const answerText = answer.text || ""; // Nội dung đáp án

                // Ghép chữ cái đáp án và nội dung trên cùng một dòng
                const combinedText = `(${optionLetter}) ${answerText}`;
                const splitCombinedText = doc.splitTextToSize(combinedText, pageWidth);

                // Hiển thị từng dòng đáp án
                splitCombinedText.forEach((line) => {
                    // Kiểm tra chiều cao trước khi thêm text
                    if (currentHeight + 10 > pageHeight) {
                        doc.addPage();
                        currentHeight = 20;
                    }

                    // Thêm dòng text
                    doc.text(line.trim(), marginLeft, currentHeight);
                    currentHeight += 5; // Cập nhật chiều cao
                });

                // Kiểm tra và thêm ảnh nếu có
                if (answer.image?.preview) {
                    let imgData;
                    if (answer.image.preview.startsWith("data:image")) {
                        imgData = answer.image.preview;
                    } else {
                        imgData = await convertImageToDataURL(answer.image.preview);
                    }

                    if (imgData) {
                        const imgWidth = 50;
                        const imgHeight = 50;
                        currentHeight += 10;
                        // Kiểm tra nếu ảnh cần sang trang mới
                        if (currentHeight + imgHeight + 10 > pageHeight) {
                            doc.addPage();
                            currentHeight = 20;
                        }

                        // Thêm khoảng cách trước khi chèn ảnh
                        doc.addImage(imgData, "PNG", marginLeft + 10, currentHeight, imgWidth, imgHeight);
                        currentHeight += imgHeight + 10;
                    }
                } else {
                    currentHeight += 5; // Khoảng cách nếu không có ảnh
                }
            }

            currentHeight += 10;
        }

        // Lưu file PDF
        doc.save(`Bài thi ${TenBaiThi}.pdf`);
    };


    // Hàm chuyển đổi ảnh từ URL sang `Data URL`
    const convertImageToDataURL = (imageURL) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous"; // Hỗ trợ tải ảnh từ nguồn khác
            img.src = imageURL;

            img.onload = () => {
                console.log("Ảnh chiều rộng:", img.width);
                console.log("Ảnh chiều cao:", img.height);
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = (error) => {
                console.error("Error converting image to Data URL:", error);
                reject(null);
            };
        });
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
            // display: 'flex',
            // justifyContent: 'center',
            // alignItems: 'center',
        },
        // bigBox: {
        //     width: "100%",
        //     height: "200px",
        //     marginBottom: "20px",
        //     // backgroundColor: 'rgba(15, 119, 113, 0.5)',
        //     borderRadius: "10px",
        //     display: "flex",
        //     justifyContent: "center",
        //     alignItems: "center",
        // },
        // smallBoxes: {
        //     display: "flex",
        //     justifyContent: "space-between",
        //     width: "100%",
        // },
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
        smallBox: {
            position: "relative",
            width: "24%",
            height: "250px",
            backgroundColor: "#84D9C4",
            borderRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginRight: "20px",
        },

        textarea: {
            width: "100%",
            height: "85%",
            backgroundColor: "transparent",
            border: "none",
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

        addSmallBoxButton: {
            backgroundColor: "#fff3",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            alignSelf: "center",
            marginLeft: "5px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "30px",
            height: "30px",
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
                                <option value="30">30s</option>
                                <option value="60">1p</option>
                                <option value="90">1p30s</option>
                                <option value="120">2p</option>
                                <option value="180">3p</option>
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
                        
                        <button className="btn btn-outline-secondary mx-2" onClick={generatePDF}>Tải về PDF</button>
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
                                <label style={styles.label}>Passcode</label>
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
                                        Có
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
                                        Không
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
                                                 <option value="30">30s</option>
                                <option value="60">1p</option>
                                <option value="90">1p30s</option>
                                <option value="120">2p</option>
                                <option value="180">3p</option>
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

                        <button className="btn btn-outline-secondary mx-2" onClick={generatePDF}>Tải về PDF</button>


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
                                            <div  className="imageWrapper">
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
                                        {item.smallBoxes.map((smallBox, boxIndex) => (
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
                                                {/* Nút xóa SmallBox */}
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
                                                    onClick={() => handleDeleteSmallBox(index, boxIndex)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>

                                                {/* Nút đánh dấu chọn */}
                                                <button
                                                    style={{
                                                        ...styles?.check,
                                                        backgroundColor: smallBox.isSelected ? "green" : "#09090980",
                                                    }}
                                                    onClick={() => handleToggleSelect(index, boxIndex)}
                                                >
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>

                                               

                                                {/* Textarea */}
                                                <textarea
                                                    name={`smallBox${boxIndex}`}
                                                    value={smallBox.text || ""}
                                                    onChange={(e) => handleChange(e, index, boxIndex)}
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

                                                 {/* Hiển thị ảnh nếu có */}
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
                                                            marginTop: "10px"
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
                                                            onClick={() => handleDeleteSmallBoxImage(index, boxIndex)}
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
                                                        onClick={() => handleUploadSmallBoxImage(index, boxIndex)}
                                                    >
                                                        <FontAwesomeIcon icon={faImage} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {/* Nút thêm SmallBox */}
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
                    <Button style={styles.addButton} onClick={handleUpdateQuiz}>
                        Lưu
                    </Button>
                </div>
            </div>

            {fileName && (
                <div>
                    <span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setShowPreview(true)}>
                        {fileName}
                    </span>
                    <Modal show={showPreview} onHide={handleClosePreview} centered>
                        <Modal.Header closeButton>
                            <Modal.Title style={{ color: 'rgb(136, 84, 152)' }}>Ảnh bìa bài thi</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ textAlign: 'center' }}>
                            {file1 && (
                                <img
                                    src={file1}
                                    alt="Preview"
                                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                                />
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={handleDeleteImageAnhBaiThi}>Xoá</Button>
                            <Button variant="secondary" onClick={handleClosePreview}>Đóng</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )}


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
        </>
    );
};

export default TestUpdate;
