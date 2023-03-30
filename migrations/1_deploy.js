const counter = artifacts.require('../contracts/TyrePressureMonitor.sol');
module.exports = function(deployer)
{
    deployer.deploy(counter);
}