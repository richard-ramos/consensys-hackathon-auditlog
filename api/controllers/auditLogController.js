'use strict';

import web3 from '../utils/getWeb3' 
import AuditLogContract from '../../build/contracts/AuditLog'
import auditLog from '../utils/auditLog'

const contract = require('truffle-contract');
const auditLogContract = contract(AuditLogContract);

module.exports.createLog = function(req, res){
	let inputData = req.body;
	

	// TODO Call IPFS library, obtain hash
	auditLog.log
	(
		1,	// user id
		2, 	// external id
		{"testKey": "testValue"}	// json object
	)
		.then(ret_hash => {
			console.log("ipfs_hash: " + ret_hash);
		});

	// TODO Call Ethereum to store the data

	console.log("Test");
    web3.eth.getAccounts(function(err, accounts) {
		if (err != null) {
		  alert("There was an error fetching your accounts.");
		  return;
		}
		console.log(accounts[0])
	})

	var contract;
	auditLogContract.deployed().then(function(instance) {
		contract = instance;
		console.log(contract)
	})

	// >>>> How can we specify the ethereum account
	var response = { success: true, receivedData: inputData, test: "test" };
	res.json(response);
};

module.exports.dataExists = function(req, res){

	auditLogContract.setProvider(web3.currentProvider);

	var response = {
		eid: req.body.eid,
		hash: "abcdefg",
		exists: false
	};

	auditLogContract.deployed()
		.then((instance) => {
			instance.getFile.call(req.body.eid)
				.then((result) => {
					if(result){
						console.log("Success");
					} else {
						console.log("Fail");
					}
				}).catch((err) => {
					  console.log("Error");
				});
		})

	auditLogContract.deployed().getFile(req.body.eid);


	// getFile(bytes32 eid)



	// TODO connect to ethereum, get info using eid, data

	res.json(response);
}
