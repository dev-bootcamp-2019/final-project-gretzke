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
      // add admins and store owners
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
    }).then(() => {
      // set storeOwners as featured storeOwners
      mp.setFeaturedStoreOwner(0, storeOwner1, {
        from: owner
      });
      mp.setFeaturedStoreOwner(1, storeOwner2, {
        from: owner
      });
    }).then(() => {
      mp.addStore('Crypto Store', 'Buy cryptocurrency hardware wallets to keep your digital assets safe.', {
        from: storeOwner1
      }).then(result => {
        // get result from ID
        const transactionHash = result.receipt.transactionHash;
        let ID;
        for (let i = 0; i < result.logs.length; i++) {
          if (result.logs[i].transactionHash === transactionHash) {
            ID = result.logs[i].args.storeID;
          }
        }
        if (ID !== undefined) {
          // add items to store
          mp.addItem(
            ID,
            'Nano Ledger S',
            'Protect your crypto assets with the most popular multicurrency hardware wallet in the market. The Ledger Nano S is built around a secure chip, ensuring optimal security.',
            web3.toWei('0.68', 'ether'),
            'QmQ5zb9r9BEEerWzvh744DYw7FSfbBP5egsWyBEv1F5rCK',
            900, {
              from: storeOwner1
            }
          );
          mp.addItem(
            ID,
            'Trezor',
            'The most trusted hardware wallet in the world. Get yours today!',
            web3.toWei('0.6', 'ether'),
            'QmZu8Symv1j6dScEpaqD8mNMaKBP8fxL4tGPrQytKAVsDV',
            1378, {
              from: storeOwner1
            }
          );
          mp.addItem(
            ID,
            'Ledger Blue',
            'Ledger Blue is a premium hardware wallet with an advanced user experience thanks to a large touchscreen interface. It is built around a Secure Element and includes all the security features you’d expect from a Ledger device.',
            web3.toWei('1.36', 'ether'),
            'QmdFYu4ysdenfsX2GrYGry82Fi1Zy62HjEBNj5nwaKbrAV',
            78, {
              from: storeOwner1
            }
          );

        }
      })
    })

  } else if (network === "rinkeby") {
    const owner = accounts[0];

    deployer.deploy(Marketplace, {
      from: owner
    });
  }
};
