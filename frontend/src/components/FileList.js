import React from "react";
import { Table } from "react-bootstrap";
import FileDetail from "./FileDetail";

function FileList({ fileList, onDelete }) {
    return (
        <div>
            <h2>Your Files</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>File Name</th>
                        <th>Created At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fileList?.map((file, index) => (
                        <FileDetail key={index} file={file} index={index} onDelete={() => onDelete(index)} />
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default FileList;
