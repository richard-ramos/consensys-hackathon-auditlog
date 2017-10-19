pragma solidity ^0.4.13;

import "./Owned.sol";

contract AuditLog is Owned{

    struct ipfsInfo {
        bytes32 hashFile;
        uint version;
    }
    // String? Bytes?
    mapping(bytes32 => ipfsInfo) public ipfsFiles;
    
    event LogIPFSfile(address owner, bytes32 ipfsFile, bytes32 eid, uint version);
    
    modifier isValidEid(bytes32 eid){ require(ipfsFiles[eidHash(eid)].version > 0); _; }
    modifier isEmptyEid(bytes32 eid){ require(ipfsFiles[eidHash(eid)].version == 0); _; }
    
    function AuditLog()
        public
    {
        
    }
    
    function getFile(bytes32 eid)
        public
        constant
        returns(bytes32 hashed)
    {
        return ipfsFiles[eidHash(eid)].hashFile;
    }

    function getCurrentVersion(bytes32 eid)
        public
        constant
        returns(uint version)
    {
        return ipfsFiles[eidHash(eid)].version;
    }

    function eidHash(bytes32 eid)
        public
        constant
        returns(bytes32 hashed)
    {
        return keccak256(eid);
    }
    
    function addFile(bytes32 eid, bytes32 ipfsFile)
        public
        isEmptyEid(eid)
        fromOwner
        returns(bool success)
    {
        ipfsFiles[eidHash(eid)].hashFile = ipfsFile;
        ipfsFiles[eidHash(eid)].version = 1;
        
        LogIPFSfile(msg.sender, ipfsFile, eid, 1);
        
        return true;
    }
    
    
    function updateFile(bytes32 eid, bytes32 ipfsFile)
        public
        isValidEid(eid)
        fromOwner
        returns(bool success)
    {
        require(ipfsFiles[eidHash(eid)].hashFile != ipfsFile);
        
        ipfsFiles[eidHash(eid)].hashFile = ipfsFile;
        ipfsFiles[eidHash(eid)].version += 1;
        
        LogIPFSfile(msg.sender, ipfsFile, eid, ipfsFiles[eidHash(eid)].version);
        
        return true;
    }
    
    
}