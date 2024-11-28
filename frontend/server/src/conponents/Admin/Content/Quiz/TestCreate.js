import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCheck, faTrash, faPlus, faImage, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown } from "react-bootstrap";
import "../../../../assets/css/CreateQuiz.css";

const TestCreate = (props) => {
    const [data, setData] = useState([
        {
            bigBox: '',
            smallBoxes: ['', '', '', ''],
            image: null
        }
    ]);

    const handleImageUpload = (index) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const newData = [...data];
                    newData[index].image = e.target.result; // Lưu URL của ảnh vào dữ liệu
                    setData(newData);
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const [quizName, setQuizName] = useState('');
    const [selectedTime, setSelectedTime] = useState('30s');
    const [selectedPoint, setSelectedPoint] = useState('1 điểm');

    const handleChange = (e, index, boxIndex = null) => {
        const newData = [...data];
        if (boxIndex !== null) {
            newData[index].smallBoxes[boxIndex] = e.target.value;
        } else {
            newData[index][e.target.name] = e.target.value;
        }
        setData(newData);
    };

    const handleAddSmallBox = (index) => {
        const newData = [...data];
        newData[index].smallBoxes.push(''); // Thêm 1 smallBox rỗng
        setData(newData);
    };

    const handleAdd = () => {
        setData([...data, {
            bigBox: '',
            smallBoxes: ['', '', '', ''] // Bắt đầu với một smallBox rỗng
        }]);
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



    return (
        <>

            <div>
                <header className="w-full font-open-sans bg-light-3 flex items-center gap-2 py-2 px-4 h-14 col-span-full">
                    <button className="transition-colors duration-200 ease-in-out flex items-center justify-center w-8 h-8 bg-dark-5% active:bg-dark-10% text-dark-2 hover:text-dark-3 rounded other relative min-w-max v-popper--has-tooltip">
                        <FontAwesomeIcon icon={faChevronLeft} className="flex items-center fas fa-chevron-left" style={{ fontSize: '12px' }} />
                    </button>

                    <div >
                        <input className="input"
                            type="text"
                            value={quizName}
                            onChange={(e) => setQuizName(e.target.value)}
                            placeholder="Nhập tên bài thi"
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="field relative">
                            <div className="dropdown flex relative rounded z-on-overlay">
                                <div className=" dropdownContainer w-full flex rounded font-semibold items-center whitespace-nowrap py-2 pl-2 pr-1 text-xs h-8 cursor-pointer bg-dark-5% text-dark-2 hover:text-dark-3 v-popper--has-tooltip">
                                    <FontAwesomeIcon icon={faCheck} />
                                    <select className="dropdown" value={selectedTime} onChange={handleTimeChange}>
                                        <option value="30">30 giây</option>
                                        <option value="60">1 phút</option>
                                        <option value="90">1 phút 30 giây</option>
                                    </select>

                                </div>
                            </div>
                        </div>
                        <div className="field relative">
                            <div className="dropdown flex relative rounded">
                                <div className="dropdownContainer w-full flex rounded font-semibold items-center whitespace-nowrap py-2 pl-2 pr-1 text-xs h-8 cursor-pointer bg-dark-5% text-dark-2 hover:text-dark-3 v-popper--has-tooltip">
                                    <FontAwesomeIcon icon={faClock} />
                                    <select className="dropdown" value={selectedPoint} onChange={handlePointChange}>
                                        <option value="1">1 điểm</option>
                                        <option value="2">2 điểm</option>
                                        <option value="3">3 điểm</option>
                                    </select>

                                </div>
                            </div>
                        </div>
                        <button className="transition-colors duration-200 ease-in-out flex items-center justify-center px-4 py-1.5 text-xs font-semibold h-8 base bg-lilac text-light-3 hover:bg-lilac-light active:bg-lilac-dark rounded primary relative min-w-max v-popper--has-tooltip">
                            Thêm
                        </button>
                    </div>
                </header>

                <main data-v-a052702 id="question-editor-main">
                    <header data-v-a0527027 id="question-editor-main-header" data-testid="editor-toolbar" className="flex items-center bg-light-2 col-span-full h-12">
                        <section data-testid="font-toolbar" className="flex items-center gap-x-2 relative pl-4">
                            <div className="v-popper v-popper--theme-menu v-popper--theme-dropdown">
                                <button className="transition-colors duration-200 ease-in-out flex items-center justify-center w-6 h-6 text-dark-2 hover:bg-lilac-faded hover:text-lilac rounded only-text relative min-w-max v-popper--has-tooltip"
                                    style={{ borderBottom: '2px solid', borderBottomLeftRadius: '0px', borderBottomRightRadius: "0px" }}>
                                    <i className="flex items-center fas fa-font text-dark-3">

                                    </i>
                                </button>

                            </div>
                            <button className="transition-colors duration-200 ease-in-out flex items-center justify-center w-6 h-6 text-dark-2 hover:bg-lilac-faded hover:text-lilac rounded only-text relative min-w-max v-popper--has-tooltip"
                                style={{ borderBottom: '2px solid', borderBottomLeftRadius: '0px', borderBottomRightRadius: "0px" }}>
                                <i className="flex items-center fas fa-font text-dark-3">

                                </i>
                            </button>
                            <button className="transition-colors duration-200 ease-in-out flex items-center justify-center w-6 h-6 text-dark-2 hover:bg-lilac-faded hover:text-lilac rounded only-text relative min-w-max v-popper--has-tooltip"
                                style={{ borderBottom: '2px solid', borderBottomLeftRadius: '0px', borderBottomRightRadius: "0px" }}>
                                <i className="flex items-center fas fa-font text-dark-3">

                                </i>
                            </button>
                        </section>
                        <button data-v-1c8df6a0 data-v-a0527027 className="transition-colors duration-200 ease-in-out flex flex items-center justify-center px-3 py-1 text-xs font-semibold h-6 text-dark-2 hover:bg-lilac-faded hover:text-lilac rounded only-text relative min-w-max mx-2 mx-2" data-testid="generic-button">
                            <i data-v-b2da2d2e data-v-1c8df6a0 className="flex items-center fas fa-function text-dark-3 mr-2">
                            </i>
                            <span data-v-1c8df6a0 className="title text-dark-3" title="Insert equation">
                                A
                            </span>
                        </button>
                        <button data-v-1c8df6a0 data-v-a0527027 className="transition-colors duration-200 ease-in-out flex flex items-center justify-center px-3 py-1 text-xs font-semibold h-6 text-dark-2 hover:bg-lilac-faded hover:text-lilac rounded only-text relative min-w-max ml-auto mr-4 text-dark-3 ml-auto mr-4 text-dark-3" data-testid="generic-button">
                            <i data-v-b2da2d2e data-v-1c8df6a0 className="flex items-center far fa-lightbulb mr-2" style={{ fontSize: '11px' }}>

                            </i>
                            <span data-v-1c8df6a0 className="title">
                                Add answer explanation
                            </span>
                        </button>
                    </header>
                    <section id="question-editor-content" className="bg-dark-6 py-4 col-span-full px-8 overflow-auto flex items-center">
                        <div data-v-a0527027 id="question-editor-content-inner" className="self-center">
                            <div data-v-a0527027 className="flex justify-center items-center flex-col gap-2 col-start-2 col-span-10 !aspect-video">
                                <div data-v-5bf325a5 data-v-a0527027 className="w-full h-full md:rounded-2xl flex-0 overflow-hidden question-editor-desktop bg-purple">
                                    <section data-v-5bf325a5 className="h-full p-4">
                                        <div data-v-5bf325a5 data-testid="mcq-editor" className="h-full flex flex-col md:grid md:grid-rows-2">
                                            <div className="query-editor relative text-center flex flex-col gap-4 justify-center items-center md:flex-grow md:flex-row md:h-auto mb-4" data-testid="query-editor">
                                                <div className="media-container flex justify-center items-center bg-dark-20% rounded-lg z-1 md:h-full w-full h-52 md:w-1/3" data-testid="media-container">
                                                    <div className="flex w-full justify-center h-full" data-testid="image-box-container" tabindex="0">
                                                        <div className="flex relative w-full justify-center h-full">
                                                            <img className="flex min-h-0 min-w-0 max-h-full max-w-full object-scale-down hover:cursor-zoom-in" data-testid="image-rendered" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div id="query-editor-tiptap-wrapper" className="rounded-lg h-52 md:h-full text-light-3 relative flex flex-col border-light-20% w-full md:w-2/3 border-1">
                                                    <div id="query-editor-tiptap-controls" className="flex justify-end p-2">

                                                    </div>
                                                    <div className="tiptap-mini flex flex-col justify-center relative h-full max-h-full overflow-y-auto w-full word-wrap-break-word px-2"
                                                        data-testid="query-editor-tiptap" style={{ '--placeholderColor': 'rgba(255, 255, 255, 0.66)', fontSize: '20px' }}>
                                                        <div id="66c446111927fd15c1a97522" data-testid="tiptap-mini-editor-content">
                                                            <div contenteditable="true" className="tiptap ProseMirror" tabindex="0">

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="options-container flex flex-col md:flex-row w-full h-full gap-2">

                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>

                        </div>
                    </section>
                </main>
            </div>

            {/* <div>
                <div >
                    <div >
                        <input
                            type="text"
                            value={quizName}
                            onChange={(e) => setQuizName(e.target.value)}
                            placeholder="Nhập tên bài thi"
                        />
                    </div>
                    <div>

                    </div>
                    <div >
                        <div >
                            <FontAwesomeIcon icon={faClock} />
                            <select value={selectedTime} onChange={handleTimeChange}>
                                <option value="30">30 giây</option>
                                <option value="60">1 phút</option>
                                <option value="90">1 phút 30 giây</option>
                            </select>
                        </div>

                        <div >
                            <FontAwesomeIcon icon={faCheck} />
                            <select value={selectedPoint} onChange={handlePointChange}>
                                <option value="1">1 điểm</option>
                                <option value="2">2 điểm</option>
                                <option value="3">3 điểm</option>
                            </select>
                        </div>


                        <Button className="btn btn-success"
                            onClick={handleAdd}>Thêm</Button>
                    </div>

                </div>





                {data.map((item, index) => (
                    <div key={index} style={styles.wrapper}>
                        <button style={styles.deleteButton} onClick={() => handleDelete(index)}>
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        <div style={styles.bigBox}>
                            <button style={styles.uploadImageButton} onClick={() => handleImageUpload(index)}>
                                <FontAwesomeIcon icon={faImage} />
                            </button>
                            {item.image && (
                                <div style={styles.imageWrapper}>
                                    <img src={item.image} alt="Preview" style={styles.previewImage} />
                                    <button style={styles.deleteImageButton} onClick={() => handleDeleteImage(index)}>
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            )}
                            <textarea
                                name="bigBox"
                                value={item.bigBox}
                                onChange={(e) => handleChange(e, index)}
                                style={styles.textareaWithImage(item.image)}
                                placeholder="Nhập câu hỏi"
                                rows="3"
                            />
                        </div>


                        <div style={styles.smallBoxes}>
                            {item.smallBoxes.map((smallBox, boxIndex) => (
                                <div
                                    key={boxIndex}
                                    style={{
                                        ...styles.smallBox,
                                        backgroundColor:
                                            boxIndex === 0 ? 'rgba(45, 112, 174, 1)' :
                                                boxIndex === 1 ? 'rgba(45, 157, 166, 1)' :
                                                    boxIndex === 2 ? 'rgba(239, 169, 41, 1)' :
                                                        boxIndex === 3 ? 'rgba(213, 84, 109, 1)' :
                                                            boxIndex === 4 ? 'rgba(154, 66, 146, 1)' : '#84D9C4'
                                    }}
                                >
                                    <button
                                        style={styles.deleteSmallButton}
                                        onClick={() => handleDeleteSmallBox(index, boxIndex)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                    <button style={styles.check}>
                                        <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <textarea
                                        name={`smallBox${boxIndex}`}
                                        value={smallBox}
                                        onChange={(e) => handleChange(e, index, boxIndex)}
                                        style={styles.textarea}
                                        placeholder="Nhập câu trả lời"
                                        rows="1"
                                    />
                                </div>
                            ))}

                            <button style={styles.addSmallBoxButton} onClick={() => handleAddSmallBox(index)}>
                                <FontAwesomeIcon icon={faPlus} />
                            </button>
                        </div>


                    </div>
                ))}

                <div>
                    <Button className="btn btn-success">
                        Lưu
                    </Button>
                </div>
            </div> */}




        </>
    );
};

export default TestCreate;
