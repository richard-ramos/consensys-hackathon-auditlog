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

    let logValue, outcomeObj;

    return this.tree.get(key)
        .then( value => {
            logValue = value;
            if (value == null) {
                console.log("Log doesn't exist");
                return { outcome: false };
            }

            // Compare by hash of the data
            if (jsonHash == value.dataHash) {
                console.log("Hash matches");
                return { outcome: true, log: value };

            } else {
                console.log("Hash doesn't match");
                return { outcome: false };
            }
        })
        .then( (outcome) => {
            outcomeObj = outcome;
            let Web3Wrapper = require('../utils/web3-wrapper');
            if(outcomeObj.outcome)
                return Web3Wrapper.get(outcome.log.retrievalKey)
            else
                return new Promise((resolve) => { resolve({}); });
        })
        .then((result) => {
            let finalResponse = false; 
            if(outcomeObj.outcome){
                if(parseInt(result[1].toString(10)) > 0)
                    finalResponse = true;
                else 
                    finalResponse = false;

                console.log("Block: %s", result[1].toString(10));
            } else
                finalResponse = false;


            if(finalResponse)
                console.log('\x1b[32m');
            else
                console.log("\x1b[31m");

            console.log("Outcome: %s", finalResponse);

            console.log("\x1b[37m");

            return finalResponse;
        });
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
        console.log("Address list is empty. Skipping blockchain call")
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

                Web3Wrapper.insert(this.retrievalKey, ipfs_address)
                    .then((result) => {
                        const logEvent = result.logs[0];
                        console.log( "IPFS address: %s%s, Block: %s", web3.toAscii(logEvent.args.ipfsAddress1), web3.toAscii(logEvent.args.ipfsAddress2), logEvent.args.blockNumber);
                    });

                this.retrievalKey = this.getHash(new Date());
            });
    }

    return;
}

let auditLog = new AuditLog();

// export the class
module.exports = auditLog;
