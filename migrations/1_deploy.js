const monitor = artifacts.require('../contracts/TyrePressureMonitor.sol');

module.exports = function(deployer)
{
    deployer.deploy(monitor);
}