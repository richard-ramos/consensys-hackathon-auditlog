var auditLogContract = artifacts.require("./AuditLog.sol");

module.exports = function(deployer) {
  deployer.deploy(auditLogContract);
};
