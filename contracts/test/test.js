const truffleAssert = require('truffle-assertions');

var Marketplace = artifacts.require('Marketplace.sol');

contract('Marketplace', accounts => {
  before(async () => {
    owner = accounts[0];
    admin1 = accounts[1];
    admin2 = accounts[2];
    shopOwner1 = accounts[3];
    shopOwner2 = accounts[4];
    instance = await Marketplace.new({ from: owner });
  });

  it('should check that owner was set correctly', async () => {
    // check if owner was set correctly
    let testedOwner = await instance.owner.call();
    assert.equal(owner, testedOwner, 'wrong owner');
  });

  it('should add admins correctly', async () => {
    // try to add admin from a non-owner account, should fail
    await truffleAssert.fails(
      instance.addAdmin(admin1, { from: admin1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not owner',
      'should have failed, should only be callable by owner'
    );

    // add admins by owner
    result = await instance.addAdmin(admin1, { from: owner });
    await instance.addAdmin(admin2, { from: owner });
    // check if addedAdmin event was emitted
    truffleAssert.eventEmitted(
      result,
      'addedAdmin',
      params => {
        return params.admin === admin1;
      },
      'addedAdmin event should be emitted with admin as parameter'
    );
    // event should not fire if addAdmin is called and admin is already added
    result = await instance.addAdmin(admin1, { from: owner });
    truffleAssert.eventNotEmitted(
      result,
      'addedAdmin',
      null,
      'addedAdmin should not be emitted'
    );

    // check if admins were added
    var isAdmin = await instance.admins.call(admin1);
    assert.equal(isAdmin, true, 'admin1 should have been added');
    isAdmin = await instance.admins.call(admin2);
    assert.equal(isAdmin, true, 'admin2 should have been added');
  });

  it('should add shopowners correctly', async () => {
    // try to add shopowner from a non-admin account, should fail
    await truffleAssert.fails(
      instance.addShopOwner(shopOwner1, { from: shopOwner2 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not admin',
      'should have failed, should only be callable by admins'
    );

    // add shopowners by admin
    result = await instance.addShopOwner(shopOwner1, { from: admin1 });
    await instance.addShopOwner(shopOwner2, { from: admin1 });
    // check if addedShopOwner event was emitted
    truffleAssert.eventEmitted(
      result,
      'addedShopOwner',
      params => {
        return params.shopOwner === shopOwner1 && params.admin === admin1;
      },
      'addedShopOwner event should be emitted with shopOwner1 and admin as parameter'
    );

    // event should not fire if addShopOwner is called and shopOwner is already added
    result = await instance.addShopOwner(shopOwner1, { from: admin1 });
    truffleAssert.eventNotEmitted(
      result,
      'addedShopOwner',
      null,
      'addedShopOwner should not be emitted'
    );

    // check if shopowners were added
    var isShopOwner = await instance.shopOwners.call(shopOwner1);
    assert.equal(isShopOwner, true, 'shopowner1 should have been added');
    isShopOwner = await instance.shopOwners.call(shopOwner2);
    assert.equal(isShopOwner, true, 'shopowner2 should have been added');
  });

  it('should remove admins correctly', async () => {
    // try to remove admin from a non-owner account, should fail
    await truffleAssert.fails(
      instance.removeAdmin(admin2, { from: admin1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not owner',
      'should have failed, should only be callable by owner'
    );
    result = await instance.removeAdmin(admin2, { from: owner });
    // check if removedAdmin event was emitted
    truffleAssert.eventEmitted(
      result,
      'removedAdmin',
      params => {
        return params.admin === admin2;
      },
      'removedAdmin event should be emitted with admin as parameter'
    );
    // event should not fire if removeAdmin is called and admin is already removed
    result = await instance.removeAdmin(admin2, { from: owner });
    truffleAssert.eventNotEmitted(
      result,
      'removedAdmin',
      null,
      'removedAdmin should not be emitted'
    );

    // check if admin was removed
    let isAdmin = await instance.admins.call(admin2);
    assert.equal(isAdmin, false, 'admin2 should have been removed');
  });

  it('should remove shopowners correctly', async () => {
    // try to remove shopowner from a non-admin account, should fail
    await truffleAssert.fails(
      instance.removeShopOwner(shopOwner2, { from: shopOwner1 }),
      truffleAssert.ErrorType.REVERT,
      'caller is not admin',
      'should have failed, should only be callable by admins'
    );

    // remove shopowners by admin
    result = await instance.removeShopOwner(shopOwner2, { from: admin1 });
    // check if removedShopOwner event was emitted
    truffleAssert.eventEmitted(
      result,
      'removedShopOwner',
      params => {
        return params.shopOwner === shopOwner2 && params.admin === admin1;
      },
      'removedShopOwner event should be emitted with shopOwner2 and admin as parameter'
    );

    // event should not fire if removeShopOwner is called and shopOwner is already removed
    result = await instance.removeShopOwner(shopOwner2, { from: admin1 });
    truffleAssert.eventNotEmitted(
      result,
      'removedShopOwner',
      null,
      'removedShopOwner should not be emitted'
    );

    // check if shopowner was removed
    let isShopOwner = await instance.shopOwners.call(shopOwner2);
    assert.equal(isShopOwner, false, 'shopowner2 should have been added');
  });
});
