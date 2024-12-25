import React from "react";
import { Button } from "react-bootstrap";

function FileDetail({ file, index, onDelete }) {
    // Format thời gian tạo
    const formatDate = (timestamp) => {
        const date = new Date(timestamp * 1000); // Chuyển từ UNIX timestamp sang milliseconds
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    // Xử lý download file
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = `http://localhost:8080/ipfs/${file.fileHash}`; // Local IPFS Gateway
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <tr>
            <td>{index + 1}</td>
            <td>{file.fileName}</td>
            <td>{formatDate(file.timestamp)}</td>
            <td>
                <Button variant="primary" onClick={handleDownload} className="me-2">
                    Download
                </Button>
                <Button variant="danger" onClick={onDelete}>
                    Delete
                </Button>
            </td>
        </tr>
    );
}

export default FileDetail;
