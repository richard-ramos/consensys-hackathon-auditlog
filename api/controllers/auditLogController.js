'use strict';

import web3 from '../utils/getWeb3' 
import AuditLogContract from '../../build/contracts/AuditLog'
//import auditLog from '../utils/auditLog'

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

    web3.eth.getAccounts(function(err, accounts) {
		if (err != null) {
		  alert("There was an error fetching your accounts.");
		  return;
		}
		console.log("Account: " + accounts[0])
	})

	var contract;
	auditLogContract.setProvider(web3.currentProvider);
	auditLogContract.deployed().then(function(instance) {
		contract = instance;
		console.log("Contract" + contract)
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
