var Marketplace = artifacts.require('Marketplace.sol');

module.exports = function(deployer, network, accounts) {
  // run if development network is used
  if ((network = 'development')) {
    const owner = accounts[0];
    // deploy marketplace contract from owner
    deployer.deploy(Marketplace, { from: owner });
  }
};
