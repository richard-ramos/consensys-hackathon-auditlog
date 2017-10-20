'use strict';

import web3 from '../utils/getWeb3' 
import AuditLogContract from '../../build/contracts/AuditLog'
import auditLog from '../utils/auditLog'

var contract = require('truffle-contract');
var auditLogContract = contract(AuditLogContract);

module.exports.createLog = function(req, res){
	let inputData = req.body;
	

	// TODO Call IPFS library, obtain hash
/*	auditLog.log
	(
		1,	// user id
		2, 	// external id
		{"testKey": "testValue"}	// json object
	)
		.then(ret_hash => {
			console.log("ipfs_hash: " + ret_hash);
		});
*/
	// TODO Call Ethereum to store the data
	
	var account;
    web3.eth.getAccounts(function(err, accounts) {
		if (err != null) {
		  alert("There was an error fetching your accounts.");
		  return;
		}
		console.log("Account: " + accounts[0]);
		account = accounts[0];
	})

	var contract;

	var eid = "test";
	var userId = "USER";
	var ipfsFile = "QmTNJbPFmcQtAy8ZGDUUqwLrxrbpApKuzTsRTgutHVkEys";

	auditLogContract.setProvider(web3.currentProvider);
	auditLogContract.deployed().then(function(instance) {
		contract = instance;
		console.log("Contract", contract.address)

		contract.addFile(eid, userId, ipfsFile, {from: account})
		.then((result) => {
			console.log(result)
		})


	}).catch(error => {
		console.log(error);
	})

	// >>>> How can we specify the ethereum account
	var response = { success: true, receivedData: inputData, test: "test" };
	res.json(response);
};


module.exports.dataExists = function(req, res){

	auditLogContract.setProvider(web3.currentProvider);

	var response = {
		request: {
			eid: req.body.eid,
			userId: req.body.userId
		},
		object: {
			hash: "",
			version: 0,
		},
		exists: false,
		valid: false,
		error: false,
		message: ""
	};

	web3.eth.getAccounts(function(err, accounts) {
		if (err != null) {
			alert("There was an error fetching your accounts.");
			response.hash = result[0];
			response.exists = false;
		  	response.error = true;
			response.message = "Error fetching accounts";
			res.json(response);
			return;
		} else {
			auditLogContract.deployed()
				.then((instance) => {
					instance.getFile.call(req.body.eid)
						.then((result) => {
							if(result){
								console.log("Success");
								response.object.hash = result[0];

								// TODO: we need to compare the hash of the object 
								//       to the hash stored on ipfs/blockchain, to 
								//       determine if it is a valid object or if
								//       it has changed

								response.valid = "TBD";


								response.object.version = parseInt(result[1].toString(10));
								response.exists = parseInt(result[1].toString(10)) > 0; 
							} else {
								response.exists = false;
								response.error = true;
								response.message = result;
								console.log("Fail");
							}
							res.json(response);
					}).catch((err) => {
						  console.log("Error");
						  response.hash = result[0];
						  response.exists = false;
						  response.error = true;
						  response.message = err;
						  res.json(response);
					});
				})
		}

	});
}
