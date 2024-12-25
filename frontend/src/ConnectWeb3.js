import Web3 from "web3";
import { FILE_STORAGE_ABI, FILE_STORAGE_ADDRESS } from "./config";

class ConnectWeb3 {
    web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    fileStorage = new this.web3.eth.Contract(FILE_STORAGE_ABI, FILE_STORAGE_ADDRESS);

    // Lấy tổng số file đã được upload
    async getFileCount() {
        try {
            const count = await this.fileStorage.methods.getFilesCount().call();
            return count;
        } catch (err) {
            console.error("Error getting file count:", err);
            return 0;
        }
    }

    // Lấy danh sách tất cả các file của người dùng hiện tại
    async getAllFilesByUploader() {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const userAddress = accounts[0];
            const indexes = await this.fileStorage.methods.getFileIndexesByUploader(userAddress).call();

            const fileDetails = await Promise.all(
                indexes.map(async (index) => {
                    const file = await this.fileStorage.methods.getFile(index).call({ from: userAddress });
                    return {
                        index,
                        fileHash: file[0],
                        fileName: file[1],
                        uploader: file[2],
                        timestamp: file[3],
                    };
                })
            );

            return fileDetails;
        } catch (err) {
            console.error("Error fetching user files:", err);
            return [];
        }
    }

    // Upload một file mới
    async uploadFile(fileHash, fileName) {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const uploader = accounts[0];
            await this.fileStorage.methods.uploadFile(fileHash, fileName).send({ from: uploader });
            console.log("File uploaded successfully:", { fileHash, fileName });
        } catch (err) {
            console.error("Error uploading file:", err);
        }
    }

    // Xóa một file
    async deleteFile(fileIndex) {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const userAddress = accounts[0];
            await this.fileStorage.methods.deleteFile(fileIndex).send({ from: userAddress });
            console.log(`File with index ${fileIndex} deleted successfully.`);
        } catch (err) {
            console.error("Error deleting file:", err);
        }
    }
}

export default ConnectWeb3;
