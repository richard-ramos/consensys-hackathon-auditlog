pragma solidity ^0.4.13;

import "./Owned.sol";

contract AuditLog is Owned {

    struct ipfsInfo {
        bytes32 ipfsAddress;
        uint blockNumber;
    }

    event LogIpfsFile(address owner, 
                      uint blockNumber, 
                      bytes32 retrievialKey, 
                      bytes32 ipfsAddress);


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