// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract FileStorage {
    // Struct để lưu trữ thông tin file
    struct File {
        string fileHash; // CID của file từ IPFS
        string fileName; // Tên file
        address uploader; // Địa chỉ của người upload
        uint timestamp; // Thời gian tạo file
    }

    // Danh sách lưu trữ các file
    File[] public files;

    // Mapping để theo dõi file index theo người dùng
    mapping(address => uint[]) private userFiles;

    // Sự kiện được phát ra khi có file mới được upload
    event FileUploaded(string fileHash, string fileName, address uploader, uint timestamp);
    event FileDeleted(uint index, address uploader);

    // Hàm upload file
    function uploadFile(string memory _fileHash, string memory _fileName) public {
        files.push(File(_fileHash, _fileName, msg.sender, block.timestamp));
        uint fileIndex = files.length - 1;
        userFiles[msg.sender].push(fileIndex);

        emit FileUploaded(_fileHash, _fileName, msg.sender, block.timestamp);
    }

    // Hàm lấy thông tin của một file dựa vào chỉ số (chỉ uploader mới được phép)
    function getFile(uint _index) public view returns (string memory, string memory, address, uint) {
        require(_index < files.length, "Invalid file index");
        File memory file = files[_index];
        require(file.uploader == msg.sender, "You do not have access to this file");
        return (file.fileHash, file.fileName, file.uploader, file.timestamp);
    }

    // Hàm lấy danh sách chỉ số file của một người dùng
    function getFileIndexesByUploader(address _uploader) public view returns (uint[] memory) {
        return userFiles[_uploader];
    }

    // Hàm xóa file (chỉ uploader mới được phép)
    function deleteFile(uint _index) public {
        require(_index < files.length, "Invalid file index");
        File memory file = files[_index];
        require(file.uploader == msg.sender, "You do not have permission to delete this file");

        // Đánh dấu file đã xóa bằng cách thay thế bằng dữ liệu trống
        delete files[_index];

        // Xóa file khỏi danh sách userFiles
        uint[] storage indexes = userFiles[msg.sender];
        for (uint i = 0; i < indexes.length; i++) {
            if (indexes[i] == _index) {
                indexes[i] = indexes[indexes.length - 1];
                indexes.pop();
                break;
            }
        }

        emit FileDeleted(_index, msg.sender);
    }

    // Hàm lấy tổng số file đã được upload
    function getFilesCount() public view returns (uint) {
        return files.length;
    }
}
