'use strict';



module.exports.createLog = function(req, res){
	let inputData = req.body;
	var response = { success: true, receivedData: inputData };

	// TODO Call IPFS library, obtain hash
	// TODO Call Ethereum to store the data
	// >>>> How can we specify the ethereum account

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