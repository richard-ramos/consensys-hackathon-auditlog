var ipfs = require('ipfs')
var stringify = require('json-stable-stringify');
var lib = require('merkle-btree');
//var web3 = require('./getWeb3.js');

// Constructor
function AuditLog() {
    this.ipfs = new ipfs();
    this.storage = new lib.IPFSStorage(this.ipfs);
    this.tree = new lib.MerkleBTree(this.storage);
}

// class methods
// return promise
AuditLog.prototype.log = function(externalId, userId, jsonObject) {
    //var key = web3.hash3(externalId);
    //key = web3.hash3(key + userId);
    var key = this.secureKey(externalId, userId);
    var value = stringify(jsonObject);

    return this.tree.put(key, value);
};

// returns promise
AuditLog.prototype.audit = function(externalId, userId, jsonObject) {
    var key = this.secureKey(externalId, userId);

    return this.tree.get(key);
};

AuditLog.prototype.secureKey = function(externalId, userId) {
    // TODO: use web3.sha3
    /*var key = web3.sha3(externalId);
    key = web3.sha3(key + userId);

    return key;*/

    return externalId + userId;
}

// export the class
module.exports = new AuditLog();
