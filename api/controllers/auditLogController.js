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

	var response = { success: true, receivedData: inputData};
	res.json(response);
};


module.exports.dataExists = function(req, res){
	var response = {
		request: {
			eid: req.body.eid,
			userId: req.body.userId
		},
		matchVersion: -1,
		matches: false,
		matchesWithLastVersion: false,
		blockNo: -1
	};

	var x = auditLog.audit
	(
		req.body.userId,	// user id
		req.body.eid, 		// external id
		req.body.jsonObject	// json object
	)
	.then( (result) => {
		response.matches = result.matches;
		response.blockNo = result.blockNo;
		response.matchesWithLastVersion = result.isLast;
		response.matchVersion = result.version;

		res.json(response);
	});
}
