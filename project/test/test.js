const truffleAssert = require('truffle-assertions');

const Marketplace = artifacts.require('Marketplace.sol');

/*
Explanation on how I wrote these tests:
- First we set up the context: define each role an account will have (makes everything easier to read) and set up our contract
- Next we check that everything inside the constructor function was set up as expected
- Then every function get's checked (I didn't check every function in my contract because it gets redundant after a while and
  I get my point across I guess).
  I wrote/tested most functions the same way using Test Driven Development following these steps:
    1. Define an input you want to put into the function and
      a. define the result of all variables that get changed for normal functions
      b. define the return value for view / pure functions
    2. make a function call and assert equal to compare the expected state changes / return value to the actual ones
    3. In case of a function that updates state it's considered best practice to fire an event.
       In that case check if all events were fired correctly using the truffle-assertions library
    4. Check access rights: If a function should be restricted, using the roles set up in our context, check permission rights,
       function throw and revert messages using the truffle-assertions library
    5. Check input values: If input values should be validated, check all edge cases on which you expect the function to throw / go through
    6. Write the smart contract function
    7. Test if test passes, if not adjust function until everything works as expected
    8. Analyse function if anything else needs to be tested, e.g.:
       - Is there a case where an event shouldn't fire
       - are there any asserts or requires that are untested
       - are there any more edge cases that need to be checked
       Write tests for these cases and check if all pass
 */

contract('Marketplace', accounts => {
  // defines roles and deploys testing contract
  before(async () => {
    owner = accounts[0];
    admin1 = accounts[1];
    admin2 = accounts[2];
    storeOwner1 = accounts[3];
    storeOwner2 = accounts[4];
    customer = accounts[5];
    instance = await Marketplace.new({
      from: owner
    });
  });

  // check that constructor was set correctly
  it('should check that contract was set up correctly', async () => {
    // check if owner was set correctly
    const testedOwner = await instance.owner.call();
    assert.equal(owner, testedOwner, 'wrong owner');
  });

  // check addAdmin function
  it('should add admins', async () => {
    // try to add admin from a non-owner account, should fail
    await truffleAssert.fails(
      instance.addAdmin(admin1, {
        from: admin1
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not owner',
      'should have failed, should only be callable by owner'
    );

    // add admins by owner
    let result = await instance.addAdmin(admin1, {
      from: owner
    });
    await instance.addAdmin(admin2, {
      from: owner
    });
    // check if AddedAdmin event was emitted
    await truffleAssert.eventEmitted(
      result,
      'AddedAdmin',
      params => {
        return params.admin === admin1;
      },
      'AddedAdmin event should be emitted with admin as parameter'
    );
    // event should not fire if addAdmin is called and admin is already added
    result = await instance.addAdmin(admin1, {
      from: owner
    });
    await truffleAssert.eventNotEmitted(
      result,
      'AddedAdmin',
      null,
      'AddedAdmin should not be emitted'
    );

    // check if admins were added
    let isAdmin = await instance.admins.call(admin1);
    assert.equal(isAdmin, true, 'admin1 should have been added');
    isAdmin = await instance.admins.call(admin2);
    assert.equal(isAdmin, true, 'admin2 should have been added');
  });

  // check addStoreOwner function
  it('should add shopowners', async () => {
    // try to add shopowner from a non-admin account, should fail
    await truffleAssert.fails(
      instance.addStoreOwner(storeOwner1, {
        from: storeOwner2
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not admin',
      'should have failed, should only be callable by admins'
    );

    // add shopowners by admin
    let result = await instance.addStoreOwner(storeOwner1, {
      from: admin1
    });
    await instance.addStoreOwner(storeOwner2, {
      from: admin1
    });
    // check if AddedStoreOwner event was emitted
    await truffleAssert.eventEmitted(
      result,
      'AddedStoreOwner',
      params => {
        return params.storeOwner === storeOwner1 && params.admin === admin1;
      },
      'AddedStoreOwner event should be emitted with storeOwner1 and admin as parameter'
    );

    // event should not fire if addStoreOwner is called and storeOwner is already added
    result = await instance.addStoreOwner(storeOwner1, {
      from: admin1
    });
    await truffleAssert.eventNotEmitted(
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

  // check removeAdmin function
  it('should remove admins', async () => {
    // try to remove admin from a non-owner account, should fail
    await truffleAssert.fails(
      instance.removeAdmin(admin2, {
        from: admin1
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not owner',
      'should have failed, should only be callable by owner'
    );

    let result = await instance.removeAdmin(admin2, {
      from: owner
    });
    // check if RemovedAdmin event was emitted
    await truffleAssert.eventEmitted(
      result,
      'RemovedAdmin',
      params => {
        return params.admin === admin2;
      },
      'RemovedAdmin event should be emitted with admin as parameter'
    );
    // event should not fire if removeAdmin is called and admin is already removed
    result = await instance.removeAdmin(admin2, {
      from: owner
    });
    await truffleAssert.eventNotEmitted(
      result,
      'RemovedAdmin',
      null,
      'RemovedAdmin should not be emitted'
    );

    // check if admin was removed
    const isAdmin = await instance.admins.call(admin2);
    assert.equal(isAdmin, false, 'admin2 should have been removed');
  });

  // check removeStoreOwner function
  it('should remove shopowners', async () => {
    // try to remove shopowner from a non-admin account, should fail
    await truffleAssert.fails(
      instance.removeStoreOwner(storeOwner2, {
        from: storeOwner1
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not admin',
      'should have failed, should only be callable by admins'
    );

    // remove shopowners by admin
    let result = await instance.removeStoreOwner(storeOwner2, {
      from: admin1
    });
    // check if RemovedStoreOwner event was emitted
    await truffleAssert.eventEmitted(
      result,
      'RemovedStoreOwner',
      params => {
        return params.storeOwner === storeOwner2 && params.admin === admin1;
      },
      'RemovedStoreOwner event should be emitted with storeOwner2 and admin as parameter'
    );

    // event should not fire if removeStoreOwner is called and storeOwner is already removed
    result = await instance.removeStoreOwner(storeOwner2, {
      from: admin1
    });
    await truffleAssert.eventNotEmitted(
      result,
      'RemovedStoreOwner',
      null,
      'RemovedStoreOwner should not be emitted'
    );

    // check if shopowner was removed
    const isStoreOwner = await instance.storeOwners.call(storeOwner2);
    assert.equal(isStoreOwner, false, 'shopowner2 should have been added');
  });

  // check addStore function
  it('should add store', async () => {
    const name = 'Test Name';
    const description = 'this is a test description';
    const sender = storeOwner1;

    // try to add store from a non-storeowner account, should fail
    await truffleAssert.fails(
      instance.addStore(name, description, {
        from: admin1
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not store owner',
      'should have failed, should only be callable by store owners'
    );

    // retreive ID of first store from result
    let result = await instance.addStore(name, description, {
      from: sender
    });
    storeID1 = result.logs[0].args.storeID;

    // add a second store
    result = await instance.addStore(name, description, {
      from: sender
    });
    // calculate the ID
    storeID2 = web3.utils.soliditySha3(name, 1, sender, result.receipt.blockNumber);

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
  });

  // check addItem function
  it('should add item', async () => {
    const name = 'Test Name';
    const description = 'this is a test description';
    itemPrice = web3.utils.toWei('0.5', 'ether');
    const image = '0x0000000000000000000000000000000000000000000000000000000000000000';
    // stock is required to be 1, for following tests to work
    itemStock = 1;
    const sender = storeOwner1;

    // try to add item from a non-storeowner account, should fail
    await truffleAssert.fails(
      instance.addItem(storeID2, name, description, itemPrice, image, itemStock, {
        from: admin1
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not store owner',
      'should have failed, should only be callable by store owners'
    );

    // retreive ID of first item from result
    let result = await instance.addItem(storeID2, name, description, itemPrice, image, itemStock, {
      from: sender
    });
    itemID1 = result.logs[0].args.itemID;
    // add a second item
    result = await instance.addItem(storeID2, name, description, itemPrice, image, itemStock, {
      from: sender
    });

    // calculate the ID
    itemID2 = web3.utils.soliditySha3(name, 1, sender, result.receipt.blockNumber);

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
    assert.equal(itemPrice, item2[3], 'itemPrice does not match');
    assert.equal(itemStock, item2[4], 'itemStock does not match');
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

  // check purchase function
  it('should purchase item', async () => {
    // try to purchase item with not matching msg.value, should fail
    await truffleAssert.fails(
      instance.purchase(storeOwner1, storeID2, itemID2, {
        from: customer,
        value: itemPrice + 1
      }),
      truffleAssert.ErrorType.REVERT,
      'sent value does not match price',
      'should have failed, should only accept if msg.value equals price'
    );

    // purchase item
    result = await instance.purchase(storeOwner1, storeID2, itemID2, {
      from: customer,
      value: itemPrice
    });

    // check if event was emitted correctly
    await truffleAssert.eventEmitted(
      result,
      'Purchase',
      params => {
        return (
          params.storeOwner === storeOwner1 &&
          params.storeID === storeID2 &&
          params.itemID === itemID2 &&
          params.customer === customer &&
          params.price.toString() === itemPrice
        );
      },
      'Purchase event should be emitted with storeOwner1, storeID, itemID, address of customer and price as parameter'
    );

    item2 = await instance.getItem(storeOwner1, storeID2, itemID2);
    // check if stock was reduced by one
    const stock = item2[4];
    assert.equal(itemStock - 1, stock, 'item stock should have been reduced by one');

    // check if balance was credited correctly
    const balance = await instance.balances(storeOwner1);
    assert.equal(itemPrice, balance, 'storeOwner should have a balance equal to the item Price');

    // try to purchase another item, should fail, as it should be out of stock
    await truffleAssert.fails(
      instance.purchase(storeOwner1, storeID2, itemID2, {
        from: customer,
        value: itemPrice
      }),
      truffleAssert.ErrorType.REVERT,
      'item out of stock',
      'should have failed, item should be out of stock'
    );
  });

  // check restock function
  it('should restock item', async () => {
    const amount = 200;
    await truffleAssert.fails(
      instance.restock(storeID2, itemID2, amount, {
        from: customer
      }),
      truffleAssert.ErrorType.REVERT,
      'caller is not store owner',
      'should have failed, should only be callable by store owners'
    );
    // get current stock
    item2 = await instance.getItem(storeOwner1, storeID2, itemID2);
    const stock = item2[4];

    const result = await instance.restock(storeID2, itemID2, amount, {
      from: storeOwner1
    });
    // check if event was emitted correctly
    await truffleAssert.eventEmitted(
      result,
      'Restocking',
      params => {
        return (
          params.storeOwner === storeOwner1 &&
          params.storeID === storeID2 &&
          params.itemID === itemID2 &&
          params.amount.toString() === amount.toString()
        );
      },
      'Restocking event should be emitted with StoreOwner, storeID, itemID and amount as parameter'
    );

    // check if amount was added to stock
    item2 = await instance.getItem(storeOwner1, storeID2, itemID2);
    assert.equal(
      parseInt(stock) + amount,
      item2[4],
      'item stock should have been incremented by amount'
    );
  });
});
