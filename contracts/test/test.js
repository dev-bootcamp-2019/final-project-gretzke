const truffleAssert = require('truffle-assertions');
const axios = require('axios');

const Marketplace = artifacts.require('Marketplace.sol');
const Utility = artifacts.require('Utility.sol');

contract('Marketplace', accounts => {
  before(async () => {
    owner = accounts[0];
    admin1 = accounts[1];
    admin2 = accounts[2];
    storeOwner1 = accounts[3];
    storeOwner2 = accounts[4];
    instance = await Marketplace.new({ from: owner });
    utility = await Utility.new();
  });

  it('should check that owner was set correctly', async () => {
    // check if owner was set correctly
    const testedOwner = await instance.owner.call();
    assert.equal(owner, testedOwner, 'wrong owner');
  });

  it('should add admins', async () => {
    // try to add admin from a non-owner account, should fail
    await truffleAssert.fails(
      instance.addAdmin(admin1, { from: admin1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not owner',
      'should have failed, should only be callable by owner'
    );

    // add admins by owner
    let result = await instance.addAdmin(admin1, { from: owner });
    await instance.addAdmin(admin2, { from: owner });
    // check if AddedAdmin event was emitted
    truffleAssert.eventEmitted(
      result,
      'AddedAdmin',
      params => {
        return params.admin === admin1;
      },
      'AddedAdmin event should be emitted with admin as parameter'
    );
    // event should not fire if addAdmin is called and admin is already added
    result = await instance.addAdmin(admin1, { from: owner });
    truffleAssert.eventNotEmitted(result, 'AddedAdmin', null, 'AddedAdmin should not be emitted');

    // check if admins were added
    let isAdmin = await instance.admins.call(admin1);
    assert.equal(isAdmin, true, 'admin1 should have been added');
    isAdmin = await instance.admins.call(admin2);
    assert.equal(isAdmin, true, 'admin2 should have been added');
  });

  it('should add shopowners', async () => {
    // try to add shopowner from a non-admin account, should fail
    await truffleAssert.fails(
      instance.addStoreOwner(storeOwner1, { from: storeOwner2 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not admin',
      'should have failed, should only be callable by admins'
    );

    // add shopowners by admin
    let result = await instance.addStoreOwner(storeOwner1, { from: admin1 });
    await instance.addStoreOwner(storeOwner2, { from: admin1 });
    // check if AddedStoreOwner event was emitted
    truffleAssert.eventEmitted(
      result,
      'AddedStoreOwner',
      params => {
        return params.storeOwner === storeOwner1 && params.admin === admin1;
      },
      'AddedStoreOwner event should be emitted with storeOwner1 and admin as parameter'
    );

    // event should not fire if addStoreOwner is called and storeOwner is already added
    result = await instance.addStoreOwner(storeOwner1, { from: admin1 });
    truffleAssert.eventNotEmitted(
      result,
      'AddedStoreOwner',
      null,
      'AddedStoreOwner should not be emitted'
    );

    // check if shopowners were added
    let isStoreOwner = await instance.storeOwners.call(storeOwner1);
    assert.equal(isStoreOwner, true, 'shopowner1 should have been added');
    isStoreOwner = await instance.storeOwners.call(storeOwner2);
    assert.equal(isStoreOwner, true, 'shopowner2 should have been added');
  });

  it('should remove admins', async () => {
    // try to remove admin from a non-owner account, should fail
    await truffleAssert.fails(
      instance.removeAdmin(admin2, { from: admin1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not owner',
      'should have failed, should only be callable by owner'
    );

    let result = await instance.removeAdmin(admin2, { from: owner });
    // check if RemovedAdmin event was emitted
    truffleAssert.eventEmitted(
      result,
      'RemovedAdmin',
      params => {
        return params.admin === admin2;
      },
      'RemovedAdmin event should be emitted with admin as parameter'
    );
    // event should not fire if removeAdmin is called and admin is already removed
    result = await instance.removeAdmin(admin2, { from: owner });
    truffleAssert.eventNotEmitted(
      result,
      'RemovedAdmin',
      null,
      'RemovedAdmin should not be emitted'
    );

    // check if admin was removed
    const isAdmin = await instance.admins.call(admin2);
    assert.equal(isAdmin, false, 'admin2 should have been removed');
  });

  it('should remove shopowners', async () => {
    // try to remove shopowner from a non-admin account, should fail
    await truffleAssert.fails(
      instance.removeStoreOwner(storeOwner2, { from: storeOwner1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not admin',
      'should have failed, should only be callable by admins'
    );

    // remove shopowners by admin
    let result = await instance.removeStoreOwner(storeOwner2, { from: admin1 });
    // check if RemovedStoreOwner event was emitted
    truffleAssert.eventEmitted(
      result,
      'RemovedStoreOwner',
      params => {
        return params.storeOwner === storeOwner2 && params.admin === admin1;
      },
      'RemovedStoreOwner event should be emitted with storeOwner2 and admin as parameter'
    );

    // event should not fire if removeStoreOwner is called and storeOwner is already removed
    result = await instance.removeStoreOwner(storeOwner2, { from: admin1 });
    truffleAssert.eventNotEmitted(
      result,
      'RemovedStoreOwner',
      null,
      'RemovedStoreOwner should not be emitted'
    );

    // check if shopowner was removed
    const isStoreOwner = await instance.storeOwners.call(storeOwner2);
    assert.equal(isStoreOwner, false, 'shopowner2 should have been added');
  });

  it('should add store', async () => {
    const name = 'Test Name';
    const description = 'this is a test description';
    const sender = storeOwner1;

    // try to add store from a non-storeowner account, should fail
    await truffleAssert.fails(
      instance.addStore(name, description, { from: admin1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not store owner',
      'should have failed, should only be callable by store owners'
    );

    // retreive ID of first store from result
    let result = await instance.addStore(name, description, { from: sender });
    storeID1 = result.logs[0].args.storeID;

    // add a second store
    result = await instance.addStore(name, description, { from: sender });
    // get timestamp of transaction to calculate the ID
    const timestamp = await web3.eth.getBlock(result.receipt.blockNumber).timestamp;
    const encodedPack = await utility.encodeID(name, 1, sender, timestamp);
    storeID2 = web3.sha3(encodedPack, { encoding: 'hex' });

    // calculated ID should match emitted ID in AddedStore event
    await truffleAssert.eventEmitted(
      result,
      'AddedStore',
      params => {
        return params.storeOwner === sender && params.storeID === storeID2;
      },
      'AddedStore event should be emitted with storeOwner1 and ID as parameter'
    );

    store2 = await instance.getStore(sender, storeID2);
    assert.equal(name, store2[0], 'name does not match');
    assert.equal(description, store2[1], 'description does not match');
    assert.equal(0, store2[2].length, 'item array should be empty');
    assert.equal(1, store2[3], 'index should equal 1');
    assert.equal(true, store2[4], 'active should be set to true');

    // check if stores are in the correct order inside the store id list
    storeIdList = await instance.getStoreIdList(sender);
    assert.equal(2, storeIdList.length, 'Store ID list should have a length of 2');
    assert.equal(storeID1, storeIdList[0], 'ID should match ID in store id list under first index');
    assert.equal(
      storeID2,
      storeIdList[store2[3]],
      'ID should match ID in store id list under store index'
    );
    // result = await instance.removeStore(ID, { from: sender });
    // console.log(await instance.getStore(sender, ID));
  });

  it('should add item', async () => {
    const name = 'Test Name';
    const description = 'this is a test description';
    const price = web3.toWei(0.01, 'ether');
    const image = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const stock = 1;
    const sender = storeOwner1;

    // try to add item from a non-storeowner account, should fail
    await truffleAssert.fails(
      instance.addItem(storeID2, name, description, price, image, stock, {
        from: admin1
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not store owner',
      'should have failed, should only be callable by store owners'
    );

    // retreive ID of first item from result
    let result = await instance.addItem(storeID2, name, description, price, image, stock, {
      from: sender
    });
    itemID1 = result.logs[0].args.itemID;
    // add a second item
    result = await instance.addItem(storeID2, name, description, price, image, stock, {
      from: sender
    });
    // get timestamp of transaction to calculate the ID
    const timestamp = await web3.eth.getBlock(result.receipt.blockNumber).timestamp;
    const encodedPack = await utility.encodeID(name, 1, sender, timestamp);
    itemID2 = web3.sha3(encodedPack, { encoding: 'hex' });

    // calculated ID should match emitted ID in AddedItem event
    await truffleAssert.eventEmitted(
      result,
      'AddedItem',
      params => {
        return (
          params.storeOwner === sender && params.storeID === storeID2 && params.itemID === itemID2
        );
      },
      'AddedItem event should be emitted with storeOwner1, storeID and itemID as parameter'
    );

    item2 = await instance.getItem(sender, storeID2, itemID2);
    assert.equal(name, item2[0], 'name does not match');
    assert.equal(description, item2[1], 'description does not match');
    assert.equal(image, item2[2], 'image bytes do not match');
    assert.equal(price, item2[3], 'price does not match');
    assert.equal(stock, item2[4], 'stock does not match');
    assert.equal(1, item2[5], 'index should equal 1');
    assert.equal(true, item2[6], 'active should be set to true');

    // check if items are in the correct order inside the store id list
    itemIdList = await instance.getItemIdList(sender, storeID2);
    assert.equal(2, itemIdList.length, 'Item ID list should have a length of 2');
    assert.equal(itemID1, itemIdList[0], 'ID should match ID in item id list under first index');
    assert.equal(
      itemID2,
      itemIdList[item2[5]],
      'ID should match ID in item id list under item index'
    );
  });
  it('should remove item', async () => {});
  it('should remove store', async () => {});
});
