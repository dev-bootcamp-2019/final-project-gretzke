var Marketplace = artifacts.require('Marketplace.sol');

module.exports = async function(deployer, network, accounts) {
  // run if development network is used
  if ((network = 'development')) {
    const owner = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];
    const storeOwner1 = accounts[3];
    const storeOwner2 = accounts[4];
    // deploy marketplace contract from owner
    await deployer.deploy(Marketplace, { from: owner });

    const mp = await Marketplace.deployed();
    await mp.addAdmin(admin1, { from: owner });
    await mp.addAdmin(admin2, { from: owner });
    await mp.addStoreOwner(storeOwner1, { from: admin1 });
    await mp.addStoreOwner(storeOwner2, { from: admin1 });
  }
};
