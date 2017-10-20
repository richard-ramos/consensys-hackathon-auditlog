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

var ipfs = require('ipfs')
var stringify = require('json-stable-stringify');
var mBTree = require('merkle-btree');

const ONE_MINUTE = 3 * 1000; //60 * 1000;

// Constructor
function AuditLog() {
    this.ipfs = new ipfs();
    this.storage = new mBTree.IPFSStorage(this.ipfs);
    this.tree = new mBTree.MerkleBTree(this.storage);
    this.retrievalKey = this.getHash(new Date());
    this.address_list = [];

    this.batchJob = this.batchJob.bind(this);

    setInterval(this.batchJob, ONE_MINUTE);
}

// class methods
AuditLog.prototype.log = function(userId, externalId, jsonObject) {
    var prev_address_key = this.getHash(externalId, userId, 'ipfs_address');
    var version = 0;
    var prev_ipfs_address = "none";

    var prev = this.tree.get(prev_address_key)
        .then( value => {
            if (value != null) {
                version = value.version;
                prev_ipfs_address = value.ipfs_address;
            }

            let data = stringify(jsonObject);
            let dataHash = this.getHash(data);
            let retrievalKey = this.retrievalKey;
            var value = {
                "prev": prev_ipfs_address,
                "version": version,
                "retrievalKey": this.retrievalKey,
                "data": data,
                "dataHash": dataHash
            };

            let key = this.getHash(externalId, userId);
            this.tree.put(key, value)
                .then( ipfs_address => {
                    this.address_list.push(ipfs_address);

                    let prev_value = {
                        'version': version + 1,
                        'ipfs_address': ipfs_address
                    };
                    this.tree.put(prev_address_key, prev_value);

                    console.log("added to ipfs!");
                });
        });

    return;
};

AuditLog.prototype.audit = function(userId, externalId, jsonObject) {
    var key = this.getHash(externalId, userId);
    var minimizedJson = stringify(jsonObject);
    var jsonHash = this.getHash(minimizedJson);

    this.tree.get(key)
        .then( value => {
            if (value == null) {
                console.log("Log doesn't exist");
                return;
            }

            console.log("values: " + stringify(value));
            // Compare by hash of the data
            if (jsonHash == value.dataHash) {
                console.log("Hash matches!");

                // TODO: get from ethereum using retrievalKey
                console.log("retrievalKey:" + value.retrievalKey);
                auditLog.getIpfsAddress(value.retrievalKey, {from: account})
                .then((result) => {
                    console.log(result)
                })


            } else {
                console.log("Hash doesn't match!");
            }
        })
};

AuditLog.prototype.getHash = function() {
    var key = "";
    for (var i = 0; i < arguments.length; i++) {
        key = web3.sha3(key + arguments[i]);
    }

    return key;
}

AuditLog.prototype.batchJob = function() {
    console.log("Batch job started");

    this.tree.put(this.retrievalKey, this.address_list)
        .then( ipfs_address => {

            this.address_list = [];  // reset


            // TODO: call smart contract with
            // retKey, ipfs_address
            this.retrievalKey = this.getHash(new Date());
            auditLog.addFile(retrievalKey, ipfs_address, {from: account})
            .then((result) => {
                console.log(result)
            })

        });

    return;
}

// export the class
module.exports = new AuditLog();
