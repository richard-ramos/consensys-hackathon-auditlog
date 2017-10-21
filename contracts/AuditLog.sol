pragma solidity ^0.4.13;

import "./Owned.sol";

contract AuditLog is Owned{

    struct ipfsInfo {
        bytes32 ipfsAddress1;
        bytes32 ipfsAddress2;
        uint blockNumber;
    }

    event LogIPFSfile(address owner, uint blockNumber, bytes32 retrievialKey, bytes32 ipfsAddress1, bytes32 ipfsAddress2);

    bytes32[] ipfsAddresses1;
    bytes32[] ipfsAddresses2;

    mapping(bytes32 => ipfsInfo) public ipfsFiles;

    function AuditLog()
        public
    {
        
    }
    
    function countAddresses()
        public
        returns(uint count)
    {
        require(ipfsAddresses1.length == ipfsAddresses2.length);
        return ipfsAddresses1.length;
    }

    function hashKey(bytes32 retrievialKey)
        public
        constant
        returns(bytes32 hashed)
    {
        return keccak256(retrievialKey);
    }

    function getIpfsInfo(bytes32 retrievialKey)
        public
        constant
        returns(bytes32 ipfsAddress1, bytes32 ipfsAddress2, uint blockNumber)
    {
        return (ipfsFiles[hashKey(retrievialKey)].ipfsAddress1, ipfsFiles[hashKey(retrievialKey)].ipfsAddress2, ipfsFiles[hashKey(retrievialKey)].blockNumber);
    }
    
    function getIpfsAddresses(uint id)
        public
        constant
        returns(bytes32 ipfsAddress1, bytes32 ipfsAddress2)
    {
        return (ipfsAddresses1[id], ipfsAddresses2[id]);
    }

    function addFile(bytes32 retrievialKey, bytes32 ipfsAddress1, bytes32 ipfsAddress2)
        public
        fromOwner
        returns(bool success)
    {
        bytes32 hash = hashKey(retrievialKey);

        require(ipfsFiles[hash].ipfsAddress1 != ipfsAddress1);
        require(ipfsFiles[hash].ipfsAddress2 != ipfsAddress2);
        require(ipfsFiles[hash].blockNumber == 0);

        ipfsFiles[hash].ipfsAddress1 = ipfsAddress1;
        ipfsFiles[hash].ipfsAddress2 = ipfsAddress2;
        ipfsFiles[hash].blockNumber = block.number;
      
        ipfsAddresses1.push(ipfsAddress1);
        ipfsAddresses2.push(ipfsAddress2);
        
        LogIPFSfile(msg.sender, block.number, retrievialKey, ipfsAddress1, ipfsAddress2);
        

        return true;
    }
    
}
