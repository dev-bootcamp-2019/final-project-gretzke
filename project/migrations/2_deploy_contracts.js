var Marketplace = artifacts.require('Marketplace.sol');

module.exports = async function (deployer, network, accounts) {
  // run if development network is used
  if (network === 'development') {
    const owner = accounts[0];
    const admin1 = accounts[1];
    const admin2 = accounts[2];
    const storeOwner1 = accounts[3];
    const storeOwner2 = accounts[4];
    // deploy marketplace contract from owner
    deployer.deploy(Marketplace, {
      from: owner
    }).then(instance => {
      mp = instance;
      mp.addAdmin(admin1, {
        from: owner
      });
    }).then(() => {
      mp.addAdmin(admin2, {
        from: owner
      });
    }).then(() => {
      mp.addStoreOwner(storeOwner1, {
        from: admin1
      });
    }).then(() => {
      mp.addStoreOwner(storeOwner2, {
        from: admin1
      });
    });

  } else if (network === "rinkeby") {
    const owner = accounts[0];

    deployer.deploy(Marketplace, {
      from: owner
    });
  }
};
