const TodoList = artifacts.require("./TodoList.sol");
const FileStorage = artifacts.require("./FileStorage.sol");

module.exports = function (deployer) {
    deployer.deploy(TodoList);
    deployer.deploy(FileStorage);
};
