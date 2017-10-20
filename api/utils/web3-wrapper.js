import web3 from '../utils/getWeb3'
import AuditLogContract from '../../build/contracts/AuditLog'

var contract = require('truffle-contract');
var auditLogContract = contract(AuditLogContract);
    auditLogContract.setProvider(web3.currentProvider);
    
var account;
    web3.eth.getAccounts(function(err, accounts) {
        account = accounts[0];
    })

function Web3Wrapper() {
    console.log("Initializing Web3Wrapper");
}

// class methods
Web3Wrapper.prototype.insert = function(retKey, ipfsAddress) {
    return auditLogContract.deployed().then(function(instance) {
        return instance.addFile(retKey, ipfsAddress, {from: account})
    })
};
   

Web3Wrapper.prototype.get = function(retKey){
    // returns ipfsAddress, blockNo
    return auditLogContract.deployed()
        .then( (instance) => instance.getIpfsAddress.call(retKey, {from: account}) )
        .then((result) => {
            return result;
        })
}

module.exports = new Web3Wrapper();
