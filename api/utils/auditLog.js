var ipfsAPI = require('ipfs-api')
var stringify = require('json-stable-stringify');
var lib = require('merkle-btree');
//var web3 = require('./getWeb3.js');

// Constructor
function AuditLog() {
    this.ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
    this.storage = new lib.IPFSStorage(this.ipfs);
    this.tree = new lib.MerkleBTree(this.storage);
}

// class methods
AuditLog.prototype.log = function(externalId, userId, jsonObject) {
    //var key = web3.hash3(externalId);
    //key = web3.hash3(key + userId);
    var key = this.secureKey(externalId, userId);
    var value = stringify(jsonObject);

    this.tree.put(key, value).then(console.log);
};

AuditLog.prototype.audit = function(externalId, userId, jsonObject) {
    var key = this.secureKey(externalId, userId);

    this.tree.get(key).then(console.log);
};

AuditLog.prototype.secureKey = function(externalId, userId) {
    // TODO: use web3.sha3
    
    return externalId + userId;
}

// export the class
module.exports = new AuditLog();
