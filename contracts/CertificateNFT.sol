// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CertificateNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Certificate {
        string name;
        string institute;
        uint256 issueDate;
        string certificateType;
        address student;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(address => uint256[]) public studentCertificates;
    mapping(address => bool) public authorizedInstitutes;

    struct CertificateRequest {
        address student;
        string name;
        address institute;
        string message;
        string studentMetadataHash; // Added to store student IPFS hash
        bool approved;
    }

    mapping(uint256 => CertificateRequest) public certificateRequests;
    uint256 public requestCounter;

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        string name,
        string institute,
        uint256 issueDate,
        string certificateType
    );

    event CertificateRequested(
        uint256 indexed requestId,
        address indexed student,
        address indexed institute,
        string name,
        string message,
        string studentMetadataHash
    );

    event CertificateRequestApproved(
        uint256 indexed requestId,
        address indexed student,
        address indexed institute
    );

    constructor() ERC721("Academic Certificate", "CERT") Ownable() {}

    function authorizeInstitute(address institute) external onlyOwner {
        authorizedInstitutes[institute] = true;
    }

    function revokeInstitute(address institute) external onlyOwner {
        authorizedInstitutes[institute] = false;
    }

    function issueCertificate(
        address student,
        string memory name,
        string memory institute,
        string memory certificateType,
        string memory tokenURI
    ) public returns (uint256) {
        require(authorizedInstitutes[msg.sender], "Not authorized to issue certificates");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(student, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        certificates[newTokenId] = Certificate({
            name: name,
            institute: institute,
            issueDate: block.timestamp,
            certificateType: certificateType,
            student: student
        });

        studentCertificates[student].push(newTokenId);

        emit CertificateIssued(
            newTokenId,
            student,
            name,
            institute,
            block.timestamp,
            certificateType
        );

        return newTokenId;
    }

    function getStudentCertificates(address student) external view returns (uint256[] memory) {
        return studentCertificates[student];
    }

    function getCertificateDetails(uint256 tokenId)
        external
        view
        returns (
            string memory name,
            string memory institute,
            uint256 issueDate,
            string memory certificateType,
            address student
        )
    {
        Certificate memory cert = certificates[tokenId];
        return (cert.name, cert.institute, cert.issueDate, cert.certificateType, cert.student);
    }

    function requestCertificate(
        address institute,
        string memory name,
        string memory message,
        string memory studentMetadataHash
    ) external {
        requestCounter++;
        certificateRequests[requestCounter] = CertificateRequest({
            student: msg.sender,
            name: name,
            institute: institute,
            message: message,
            studentMetadataHash: studentMetadataHash,
            approved: false
        });

        emit CertificateRequested(
            requestCounter,
            msg.sender,
            institute,
            name,
            message,
            studentMetadataHash
        );
    }

    function approveCertificateRequest(
        uint256 requestId,
        string memory certificateType,
        string memory tokenURI,
        string memory institute
    ) external {
        CertificateRequest storage request = certificateRequests[requestId];

        require(request.student != address(0), "Invalid request");
        require(authorizedInstitutes[msg.sender], "Not authorized to approve");
        require(!request.approved, "Already approved");

        issueCertificate(
            request.student,
            request.name,
            institute,
            certificateType,
            tokenURI
        );

        request.approved = true;

        emit CertificateRequestApproved(requestId, request.student, msg.sender);
    }
}