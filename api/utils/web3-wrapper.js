import web3 from '../utils/getWeb3'
import AuditLogContract from '../../build/contracts/AuditLog'

var contract = require('truffle-contract');
var auditLogContract = contract(AuditLogContract);
    auditLogContract.setProvider(web3.currentProvider);


function Web3Wrapper() {

}

// class methods
Web3Wrapper.prototype.insert = function(retKey, ipfsAddress) {

};
   

Web3Wrapper.prototype.get = function(retKey){
	// returns ipfsAddress, blockNo
}


