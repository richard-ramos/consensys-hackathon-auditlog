import web3 from '../utils/getWeb3'

var ipfs = require('ipfs')
var stringify = require('json-stable-stringify');
var mBTree = require('merkle-btree');

const ONE_MINUTE = 3 * 1000; //60 * 1000;

var address_list = [];

// Constructor
function AuditLog() {
    this.ipfs = new ipfs();
    this.storage = new mBTree.IPFSStorage(this.ipfs);
    this.tree = new mBTree.MerkleBTree(this.storage);
    this.retrievalKey = this.getHash(new Date());

    console.log("RetrievalKey: " + this.retrievalKey);

    address_list = [];

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
                    address_list.push(ipfs_address);
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

    return this.tree.get(key)
        .then( value => {
            if (value == null) {
                console.log("Log doesn't exist");
                return;
            }

            console.log("values: " + stringify(value));
            // Compare by hash of the data
            if (jsonHash == value.dataHash) {
                console.log("Hash matches!");

                console.log("retrievalKey:" + value.retrievalKey);

                let Web3Wrapper = require('../utils/web3-wrapper');
                var ipfsResult = Web3Wrapper.get(value.retrievalKey)
                console.log(ipfsResult);
                   
                


                return true;

            } else {
                console.log("Hash doesn't match!");
                return false;
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

    if (address_list.length <= 0) {
        console.log("array is empty! Skipping call to blockchain.")
    } else {
        this.ipfs.dag.put(
            this.address_list,
            { format: 'dag-cbor', hashAlg: 'sha2-256' },
            (err, cid) =>
            {
                address_list = []; // reset
                let ipfs_address = cid.toBaseEncodedString();
                console.log(ipfs_address);

                let Web3Wrapper = require('../utils/web3-wrapper');

                var ipfsFilePromise = Web3Wrapper.insert(this.retrievalKey, ipfs_address);

                if(ipfsFilePromise != undefined)
                    ipfsFilePromise.then((result) => {
                        const logEvent = result.logs[0];
                        console.log({"ipfsAddress": logEvent.args.ipfsAddress, "blockNumber": logEvent.args.blockNumber});
                    });

                this.retrievalKey = this.getHash(new Date());
            });
    }

    return;
}

let auditLog = new AuditLog();

// export the class
module.exports = auditLog;
