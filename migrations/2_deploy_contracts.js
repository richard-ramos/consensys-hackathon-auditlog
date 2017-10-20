var AuditLogContract = artifacts.require("./AuditLog.sol");

module.exports = function(deployer) {
  deployer.deploy(AuditLogContract);
};
