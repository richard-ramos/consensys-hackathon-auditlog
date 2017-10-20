'use strict';

import web3 from '../utils/getWeb3'
import AuditLogContract from '../../build/contracts/AuditLog'
import auditLog from '../utils/auditLog'

var contract = require('truffle-contract');
var auditLogContract = contract(AuditLogContract);

module.exports.createLog = function(req, res){
	let inputData = req.body;

	auditLog.log
	(
		req.body.userId,	// user id
		req.body.eid, 		// external id
		req.body.jsonObject	// json object
	);

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

	auditLog.audit
	(
		req.body.userId,	// user id
		req.body.eid, 		// external id
		req.body.jsonObject	// json object
	);

	res.json(response);
}
