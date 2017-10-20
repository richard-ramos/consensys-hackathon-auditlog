import web3 from '../utils/getWeb3'
import AuditLogContract from '../../build/contracts/AuditLog'

var contract = require('truffle-contract');
var auditLogContract = contract(AuditLogContract);
    auditLogContract.setProvider(web3.currentProvider);
    var auditLog;
    auditLogContract.deployed().then(function(instance) {
        auditLog = instance;
        console.log("Contract", auditLog.address)
    }).catch(error => {
        console.log(error);
    })
var account;
    web3.eth.getAccounts(function(err, accounts) {
        account = accounts[0];
    })

function Web3Wrapper() {
    console.log("Initializing Web3Wrapper");
}

// class methods
Web3Wrapper.prototype.insert = function(retKey, ipfsAddress) {

    if(auditLog != undefined){
        return auditLog.addFile(retKey, ipfsAddress, {from: account})
    }
    

};
   

Web3Wrapper.prototype.get = function(retKey){
    // returns ipfsAddress, blockNo
    if(auditLog != undefined)
        auditLog.getIpfsAddress.call(retKey, {from: account})
        .then((result) => {
            return ({"ipfsAddress": result.ipfsAddress, "blockNumber": result.blockNumber})
        })
    else 
        return {};
}

module.exports = new Web3Wrapper();
