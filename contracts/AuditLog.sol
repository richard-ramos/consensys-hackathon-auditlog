pragma solidity ^0.4.13;

import "./Owned.sol";

contract AuditLog is Owned{

    // struct ipfsInfo {
    //     bytes32 hashFile;
    //     uint version;
    // }
    // // String? Bytes?
    // mapping(bytes32 => ipfsInfo) public ipfsFiles;
    
    // event LogIPFSfile(address owner, bytes32 ipfsFile, bytes32 eid, bytes32 userId, uint version);
    
    // modifier isValidEid(bytes32 eid, bytes32 userId){require(ipfsFiles[eidHash(eid, userId)].version > 0); _;}
    // modifier isEmptyEid(bytes32 eid, bytes32 userId){require(ipfsFiles[eidHash(eid, userId)].version == 0); _;}
    
    // function AuditLog()
    //     public
    // {
        
    // }
    
    // function getFile(bytes32 eid, bytes32 userId)
    //     public
    //     constant
    //     returns(bytes32 hashed, uint version)
    // {
    //     return (ipfsFiles[eidHash(eid, userId)].hashFile, ipfsFiles[eidHash(eid, userId)].version);
    // }


    // function getCurrentVersion(bytes32 eid, bytes32 userId)
    //     public
    //     constant
    //     returns(uint version)
    // {
    //     return ipfsFiles[eidHash(eid, userId)].version;
    }

    // function eidHash(bytes32 eid, bytes32 userId)
    //     public
    //     constant
    //     returns(bytes32 hashed)
    // {
    //     return keccak256(eid, userId);
    // }
    
    // function addFile(bytes32 eid, bytes32 userId, bytes32 ipfsFile)
    //     public
    //     isEmptyEid(eid, userId)
    //     fromOwner
    //     returns(bool success)
    // {
    //     bytes32 hash = eidHash(eid, userId);

    //     require(ipfsFiles[hash].hashFile != ipfsFile);

    //     ipfsFiles[hash].hashFile = ipfsFile;
    //     ipfsFiles[hash].version += 1;
        
    //     LogIPFSfile(msg.sender, ipfsFile, eid, userId, 1);
        
    //     return true;
    // }
    
    
    // function updateFile(bytes32 eid, bytes32 userId, bytes32 ipfsFile)
    //     public
    //     isValidEid(eid, userId)
    //     fromOwner
    //     returns(bool success)
    // {
    //     bytes32 hash = eidHash(eid, userId);

    //     require(ipfsFiles[hash].hashFile != ipfsFile);
        
    //     ipfsFiles[hash].hashFile = ipfsFile;
    //     ipfsFiles[hash].version += 1;
        
    //     LogIPFSfile(msg.sender, ipfsFile, eid, userId, ipfsFiles[hash].version);
        
    //     return true;
    // }

    struct ipfsInfo {
        bytes32 ipfsAddress;
        uint blockNumber;
    }

    event LogIpfsFile(address owner, uint blockNumber, bytes32 retrievialKey, bytes32 ipfsAddress);


    mapping(bytes32 => ipfsInfo) public ipfsFiles;

    function AuditLog()
        public
    {
        
    }

    function hashKey(bytes32 retrievialKey)
        public
        constant
        returns(bytes32 hashed)
    {
        return keccak256(retrievialKey);
    }

    function getIpfsAddress(bytes32 retrievialKey)
        public
        constant
        returns(bytes32 ipfsAddress, uint blockNumber)
    {
        return (ipfsFiles[hashKey(retrievialKey)].ipfsAddress, ipfsFiles[hashKey(retrievialKey)].blockNumber);
    }

    function addFile(bytes32 retrievialKey, bytes32 ipfsAddress)
        public
        fromOwner
        returns(bool success)
    {
        bytes32 hash = hashKey(retrievialKey);

        require(ipfsFiles[hash].ipfsAddress != ipfsAddress);
        require(ipfsFiles[hash].blockNumber == 0);

        ipfsFiles[hash].ipfsAddress = ipfsAddress;
        ipfsFiles[hash].blockNumber = block.number;
        
        LogIpfsFile(msg.sender, block.number, retrievialKey, ipfsAddress);
        
        return true;
    }
    
}