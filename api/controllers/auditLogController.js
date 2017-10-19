'use strict';

import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

import AuditLog_artifacts from './../../build/contracts/AuditLog.json'

module.exports.createLog = function(req, res){
	let inputData = req.body;
	

	// TODO Call IPFS library, obtain hash
	// TODO Call Ethereum to store the data

	console.log("Test");
	// >>>> How can we specify the ethereum account
	var response = { success: true, receivedData: inputData, test: "test" };
	res.json(response);
};

module.exports.dataExists = function(req, res){
	var response = { 
		eid: req.body.eid,
		hash: "abcdefg",
		exists: false 
	};

	// TODO connect to ethereum, get info using eid, data, and userId

	res.json(response);
}