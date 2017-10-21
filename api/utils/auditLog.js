import web3 from '../utils/getWeb3'

var ipfsAPI = require('ipfs-api')
var stringify = require('json-stable-stringify');
var mBTree = require('merkle-btree');

const ONE_MINUTE = 3 * 1000; //60 * 1000;

var g_address_list = [];
var g_ipfs;
var g_map = {};
var g_retrievalKey = getHash(new Date());
const IPFS_GATEWAY = '/ip4/127.0.0.1/tcp/5001';

// Constructor
function AuditLog() {
    g_ipfs = new ipfsAPI(IPFS_GATEWAY);
    g_map = {};
    g_retrievalKey = getHash(new Date());

    buildMap();
    setInterval(batchJob, ONE_MINUTE);
}

// class methods
AuditLog.prototype.log = function(userId, externalId, jsonObject) {
    console.log("user id: " + userId);
    console.log("external id: " + externalId);

    var key = getHash(userId, externalId);
    var prev_ipfs_address = "none";
    var data = stringify(jsonObject);

    let value = {
        "key": key,
        "prev": prev_ipfs_address,
        "version": 0,
        "retrievalKey": g_retrievalKey,
        "data": data,
        "dataHash": getHash(data)
    }

    if (g_map.hasOwnProperty(key)) { // exists => append
        prev_ipfs_address = g_map[key];
        value.prev = prev_ipfs_address;

        readFromIpfs(prev_ipfs_address)
            .then( (result) => {
                let jsonData_ = JSON.parse(result);
                value.version = jsonData_['version'] + 1;
                addToIpfs(value);
            });
    } else {
        addToIpfs(value);
    }

    return;
};

AuditLog.prototype.audit = async function(userId, externalId, jsonObject) {
    var key = getHash(userId, externalId);
    var minimizedJson = stringify(jsonObject);
    var jsonHash = getHash(minimizedJson);

    let finalResponse = {
        "matches": false,
        "blockNo": -1,
        "isLast": false,
        "version": -1
    };

    let isHashMatch = false;
    if (!g_map.hasOwnProperty(key)) {
        console.log("Log doesn't exist");
    } else {
        console.log("Log exists");
        let ipfs_address = g_map[key];
        let currentData = await readFromIpfs(ipfs_address);
        let currentDataJson = JSON.parse(currentData);
        let lastVersion = currentDataJson['version'];
        let prevAddress = ipfs_address; // last data

        for (var i = lastVersion; i >= 0; i--) {
            let data_ = await readFromIpfs(prevAddress);
            let dataJson_ = JSON.parse(data_);
            let version_ = dataJson_['version'];
            prevAddress = dataJson_['prev'];

            if (dataJson_['dataHash'] == jsonHash) {
                console.log("Hash matches with version:" + version_ + " lastVersion=" + lastVersion);
                isHashMatch = true;
                finalResponse['matches'] = true;
                finalResponse['version'] = version_;
                if (version_ == lastVersion) finalResponse['isLast'] = true;

                // TODO: access ethereum and get blockNumber

                break;
            }
        }
    }

    return finalResponse;
};

function getHash() {
    var key = "";
    for (var i = 0; i < arguments.length; i++) {
        key = web3.sha3(key + arguments[i]);
    }

    return key;
}

function batchJob() {
    console.log("Batch job started");

    if (g_address_list.length <= 0) {
        console.log("Address list is empty. Skipping blockchain call")
    } else {
        // Adds address_list to ipfs
        g_ipfs.files.add(new Buffer(stringify(g_address_list), `utf8`))
            .then(res => {
                let ipfs_address = res[0].hash;

                console.log("added pages to ipfs! ipfs/" + ipfs_address + " retKey:" + g_retrievalKey);

                // add to blockchain
                let Web3Wrapper = require('../utils/web3-wrapper');

                Web3Wrapper.insert(g_retrievalKey, ipfs_address)
                    .then((result) => {
                        const logEvent = result.logs[0];
                        console.log( "IPFS address: %s, Block: %s", web3.toAscii(logEvent.args.ipfsAddress1 + logEvent.args.ipfsAddress2), logEvent.args.blockNumber);
                    });

                // reset pages and retKey
                g_retrievalKey = getHash(new Date());
                g_address_list = [];
            });
    }

    return;
}

function addToIpfs(value) {
    g_ipfs.files.add(new Buffer(stringify(value), `utf8`))
        .then(res => {
            let ipfs_address = res[0].hash;
            g_address_list.push(ipfs_address);
            g_map[value.key] = ipfs_address;
            console.log("added to ipfs! ipfs/" + ipfs_address + " version:" + value.version);
        });
}

function readFromIpfs(ipfs_address) {
    return g_ipfs.files.cat(ipfs_address)
      .then(stream => {
        return new Promise((resolve, reject) => {
          let res = ``;

          stream.on(`data`, function (chunk) {
            res += chunk.toString();
          });

          stream.on(`error`, function (err) {
            reject(err);
          });

          stream.on(`end`, function () {
            resolve(res);
          });
        });
      });
}

async function buildMap() {
    console.log("HashMap building starts...");

    let processedFilesCount = 0;
    let Web3Wrapper = require('../utils/web3-wrapper');
    let ipfs_batch_addresses = await Web3Wrapper.getArr();
    //console.log(ipfs_batch_addresses);

    // clear addressess
    for (var i = 0; i < ipfs_batch_addresses.length; i++) {
        ipfs_batch_addresses[i] = ipfs_batch_addresses[i].substr(0, 46);
    }

    for (var i = 0; i < ipfs_batch_addresses.length; i++) {
        let result = await readFromIpfs(ipfs_batch_addresses[i]);
        let ipfs_addresses = JSON.parse(result);

        for (var j = 0; j < ipfs_addresses.length; j++) {
            processedFilesCount++;
            let data = await readFromIpfs(ipfs_addresses[j]);
            let jsonData = JSON.parse(data);

            let key = jsonData['key'];
            let ipfs_address = ipfs_addresses[j];
            let version = jsonData['version'];

            if (!g_map.hasOwnProperty(key)) {
                g_map[key] = ipfs_address;
            } else {
                let otherData = await readFromIpfs(g_map[key]);
                let otherJsonData = JSON.parse(otherData);

                if (otherJsonData['version'] < version) {
                    g_map[key] = ipfs_address;    // change only when new version
                }
            }
        }
    }

    console.log("HashMap building processed " + processedFilesCount + " files");
    console.log("HashMap size: " + Object.keys(g_map).length);
    console.log("HashMap built successfully");
    return;
}

let auditLog = new AuditLog();

// export the class
module.exports = auditLog;
