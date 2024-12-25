import React, { useCallback, useEffect, useState } from "react";
import { create } from "ipfs-http-client";
import { ethers } from "ethers";
import "../css/WalletCard.css";
import FileList from "./FileList";
import ConnectWeb3 from "../ConnectWeb3";
import {Modal, Form, Button} from "react-bootstrap";

const WalletCard = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const [connButtonText, setConnButtonText] = useState("Connect Wallet");

    const [fileList, setFileList] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [fileName, setFileName] = useState("");
    const [fileBuffer, setFileBuffer] = useState(null);

    // Tạo IPFS client
    const ipfs = create({ url: "http://localhost:8080/ipfs" });

    const connectWeb3 = new ConnectWeb3();

    // Xử lý chọn file
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = () => setFileBuffer(Buffer(reader.result));
        setFileName(file.name);
    };

    // Upload file lên IPFS và blockchain
    const handleUpload = async () => {
        if (!fileBuffer || !fileName) return;

        try {
            // Upload file lên IPFS
            const result = await ipfs.add(fileBuffer);
            const fileHash = result.path; // CID từ IPFS

            // Upload thông tin file lên blockchain
            await connectWeb3.uploadFile(fileHash, fileName);

            // Sau khi upload, cập nhật danh sách file
            fetchFiles();
            setShowUploadModal(false);
            setFileName("");
            setFileBuffer(null);
        } catch (error) {
            setErrorMessage("Error uploading file: " + error.message);
        }
    };

    // Kết nối ví MetaMask
    const connectWalletHandler = () => {
        if (window.ethereum && window.ethereum.isMetaMask) {
            window.ethereum
                .request({ method: "eth_requestAccounts" })
                .then((result) => {
                    accountChangedHandler(result[0]);
                    setConnButtonText("Wallet Connected");
                    getAccountBalance(result[0]);
                })
                .catch((error) => setErrorMessage(error.message));
        } else {
            setErrorMessage("Please install MetaMask browser extension to interact.");
        }
    };

    // Xử lý khi tài khoản thay đổi
    const accountChangedHandler = async (newAccount) => {
        setDefaultAccount(newAccount);
        getAccountBalance(newAccount.toString());
        fetchFiles();
    };

    // Lấy danh sách file
    const fetchFiles = async () => {
        try {
            const files = await connectWeb3.getAllFilesByUploader();
            setFileList(files);
        } catch (error) {
            setErrorMessage("Error fetching files: " + error.message);
        }
    };

    // Lấy số dư tài khoản
    const getAccountBalance = (account) => {
        window.ethereum
            .request({ method: "eth_getBalance", params: [account, "latest"] })
            .then((balance) => setUserBalance(ethers.utils.formatEther(balance)))
            .catch((error) => setErrorMessage(error.message));
    };

    // Xử lý thay đổi chain
    const chainChangedHandler = () => {
        window.location.reload();
    };

    // Lắng nghe sự kiện MetaMask
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", accountChangedHandler);
            window.ethereum.on("chainChanged", chainChangedHandler);
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", accountChangedHandler);
                window.ethereum.removeListener("chainChanged", chainChangedHandler);
            }
        };
    }, []);

    return (
        <div className="walletCard">
            <button className="btnConnect" onClick={connectWalletHandler}>
                {connButtonText}
            </button>
            <div className="accountDisplay">
                <h3 className="labelText">Address: </h3>
                <h2>{defaultAccount}</h2>
            </div>
            <div className="balanceDisplay">
                <h3>Balance: {userBalance} ETH</h3>
            </div>
            {errorMessage && <p className="errorMessage">{errorMessage}</p>}
            <Button onClick={() => setShowUploadModal(true)}>Upload File</Button>
            <FileList fileList={fileList} />

            {/* Modal Upload File */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Choose File</Form.Label>
                            <Form.Control type="file" onChange={handleFileChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!fileName || !fileBuffer}
                    >
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default WalletCard;