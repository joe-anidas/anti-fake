// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserRegistry {
    struct User {
        string role;
        string metadataHash;
    }

    mapping(address => User) public users;
    address[] private registeredAddresses;

    event Registered(
        address indexed user,
        string role,
        string metadataHash
    );

    function registerUser(
        string memory role,
        string memory metadataHash
    ) external {
        require(bytes(users[msg.sender].role).length == 0, "Already registered");
        registeredAddresses.push(msg.sender);
        users[msg.sender] = User(role, metadataHash);
        emit Registered(msg.sender, role, metadataHash);
    }

    function getAllUsers() external view returns (address[] memory) {
        return registeredAddresses;
    }

    function getUser(address userAddress)
        external
        view
        returns (string memory role, string memory metadataHash)
    {
        User memory user = users[userAddress];
        return (user.role, user.metadataHash);
    }

    function isUserRegistered(address userAddress) external view returns (bool) {
        return bytes(users[userAddress].role).length > 0;
    }

    function getRole(address userAddress) external view returns (string memory) {
        return users[userAddress].role;
    }
}
