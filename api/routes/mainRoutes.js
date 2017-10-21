'use strict';

module.exports = function(app){
	var auditLog = require('../controllers/auditLogController');

	
	app.route('/api/log')
		.post(auditLog.createLog);

	app.route('/api/audit')
		.post(auditLog.dataExists);


}
