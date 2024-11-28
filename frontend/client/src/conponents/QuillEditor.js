import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../assets/scss/Quill.css"
const QuillEditor = ({ value, onChange }) => {
    const modules = {
        toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ color: [] }, { background: [] }],
            ["clean"],
        ],

    };

    return (
        <ReactQuill
            value={value}
            onChange={onChange}
            modules={modules}
            theme="snow"
            style={{
                height: "100%",
                background: "#fff",
                borderRadius: "5px",
                border: "1px solid #ccc",
            }}
        />
    );
};

export default QuillEditor;
