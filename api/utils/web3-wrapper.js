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
    let ipfsAddress1 = web3.fromAscii(ipfsAddress.substring(0,32), 32);
    let ipfsAddress2 = web3.fromAscii(ipfsAddress.substring(32), 32);

    return auditLogContract.deployed().then(function(instance) {
        return instance.addFile(retKey, ipfsAddress1, ipfsAddress2, {from: account, gas: 4000000})
    })
};


Web3Wrapper.prototype.getArr = function(){
    var contract

    return auditLogContract.deployed()
        .then((instance) => {
            contract = instance;
            return contract.countAddresses.call({from: account});
            })
        .then((count) => asyncLoopOrdered(count, contract))
};

function asyncLoopOrdered(times, contract) {
    var iterations = [];
    var result = [];
    for (var i = 0; i < times; i++) {
        iterations.push(contract.getIpfsAddresses.call(i, {from: account}));
    }

    return Promise.all(iterations).then(function(output) {
        for (var i = 0; i < times; i++) {
            result.push(web3.toAscii(output[i][0]) + web3.toAscii(output[i][1]))  
        }
        return result; //add the output all at once when all have completed
    });
}

Web3Wrapper.prototype.get = function(retKey){
    // returns ipfsAddress, blockNo
    return auditLogContract.deployed()
        .then( (instance) => instance.getIpfsInfo.call(retKey, {from: account}) )
        .then((result) => {
            return result;
        })
}

module.exports = new Web3Wrapper();
