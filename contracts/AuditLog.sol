pragma solidity ^0.4.13;

import "./Owned.sol";

contract AuditLog is Owned{

    struct ipfsInfo {
        bytes32 hashFile;
        uint version;
    }
    // String? Bytes?
    mapping(bytes32 => ipfsInfo) public ipfsFiles;
    
    event LogIPFSfile(address owner, bytes32 ipfsFile, bytes32 eid, bytes32 userId, uint version);
    
    modifier isValidEid(bytes32 eid, bytes32 userId){ require(ipfsFiles[eidHash(eid, userId)].version > 0); _; }
    modifier isEmptyEid(bytes32 eid, bytes32 userId){ require(ipfsFiles[eidHash(eid, userId)].version == 0); _; }
    
    function AuditLog()
        public
    {
        
    }
    
    function getFile(bytes32 eid, bytes32 userId)
        public
        constant
        returns(bytes32 hashed, uint version)
    {
        return (ipfsFiles[eidHash(eid, userId)].hashFile, ipfsFiles[eidHash(eid, userId)].version);
    }


    function getCurrentVersion(bytes32 eid, bytes32 userId)
        public
        constant
        returns(uint version)
    {
        return ipfsFiles[eidHash(eid, userId)].version;
    }

    function eidHash(bytes32 eid, bytes32 userId)
        public
        constant
        returns(bytes32 hashed)
    {
        return keccak256(eid, userId);
    }
    
    function addFile(bytes32 eid, bytes32 userId, bytes32 ipfsFile)
        public
        isEmptyEid(eid, userId)
        fromOwner
        returns(bool success)
    {
        bytes32 hash = eidHash(eid, userId);

        ipfsFiles[hash].hashFile = ipfsFile;
        ipfsFiles[hash].version = 1;
        
        LogIPFSfile(msg.sender, ipfsFile, eid, userId, 1);
        
        return true;
    }
    
    
    function updateFile(bytes32 eid, bytes32 userId, bytes32 ipfsFile)
        public
        isValidEid(eid, userId)
        fromOwner
        returns(bool success)
    {
        bytes32 hash = eidHash(eid, userId);

        require(ipfsFiles[hash].hashFile != ipfsFile);
        
        ipfsFiles[hash].hashFile = ipfsFile;
        ipfsFiles[hash].version += 1;
        
        LogIPFSfile(msg.sender, ipfsFile, eid, userId, ipfsFiles[hash].version);
        
        return true;
    }
    
    
}