'use strict';

import getWeb3 from '../utils/getWeb3'
import AuditLogContract from '../../build/contracts/AuditLog'
import auditLog from '../utils/auditLog'

const contract = require('truffle-contract');
const auditLogContract = contract(AuditLogContract);


module.exports.createLog = function(req, res){
	let inputData = req.body;
	var response = { success: true, receivedData: inputData };

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
	// >>>> How can we specify the ethereum account

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
