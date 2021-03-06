import { Injectable } from '@angular/core';
import * as Web3 from 'web3';
import * as contract from 'truffle-contract';

export class Stores {
  [storeID: string]: {
    name: string;
    description: string;
    itemIdList: string[];
    index: number;
    active: boolean;
  };
}

export class Store {
  name: string;
  description: string;
  itemIdList: string[];
  index: number;
  active: boolean;
}

export class Items {
  [itemID: string]: {
    name: string;
    description: string;
    image: string;
    price: number;
    stock: number;
    index: number;
    active: boolean;
  };
}

export class Item {
  name: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  index: number;
  active: boolean;
}

declare let require: any;
declare let window: any;

const marketplaceArtifact = require('../../build/contracts/Marketplace.json');

@Injectable()
export class SmartContractService {
  public web3: any;
  public accounts: string[] = [];
  private provider: any;
  public Marketplace: any;

  public owner: string;
  public admin: string;
  public storeOwner: string;
  public customer: string;

  public admins: string[] = [];
  public storeOwners: string[] = [];
  public featuredStoreOwners: string[] = [];

  constructor() {}

  async localWeb3() {
    // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
    Web3.providers.HttpProvider.prototype.sendAsync =
      Web3.providers.HttpProvider.prototype.send;
    // set local web3 provider
    this.provider = new Web3.providers.HttpProvider('http://localhost:8545');
    this.web3 = new Web3(this.provider);
    // check connectivity
    let isConnected = false;
    try {
      isConnected = await this.web3.eth.net.isListening();
    } finally {
      return isConnected;
    }
  }

  async injectedWeb3() {
    // set local web3 provider
    // Modern dapp browsers...
    if (window.ethereum) {
      this.provider = window.ethereum;
      // Legacy dapp browsers...
    } else if (window.web3) {
      this.provider = window.web3.currentProvider;
    }
    this.web3 = new Web3(this.provider);
    // check connectivity
    let isConnected = false;
    try {
      isConnected = await this.web3.eth.net.isListening();
    } finally {
      return isConnected;
    }
  }

  async getNetworkVersion() {
    return await this.web3.eth.net.getId();
  }

  async getAccounts() {
    this.web3.eth.getAccounts(async (err, accounts) => {
      if (err != null) {
        console.warn('There was an error fetching your accounts:\n' + err);
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accounts.length === 0) {
        alert(
          'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
        );
        try {
          // Request account access
          await window.ethereum.enable();
          await this.getAccounts();
        } catch (error) {
          // User denied account access...
          alert('This DApp needs user account access');
        }
        return;
      }
      this.accounts = accounts;
      if (accounts.length === 1) {
        this.customer = accounts[0];
      }
      this.getRoles();
    });
  }

  // sets contract variable, returns true if contract was set up successfully
  async setContract() {
    const Marketplace = contract(marketplaceArtifact);
    Marketplace.setProvider(this.provider);
    this.Marketplace = await Marketplace.deployed();
    const bytecode = await this.web3.eth.getCode(this.Marketplace.address);
    // if bytecode is '0x' or '0x0' return false
    return bytecode !== '0x0' && bytecode !== '0x';
  }

  async getRoles() {
    let owner;
    const admins = [];
    const storeOwners = [];
    const currentOwner = await this.Marketplace.owner();
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].toLowerCase() === currentOwner) {
        owner = this.accounts[i];
      }
      if (await this.Marketplace.admins(this.accounts[i])) {
        admins.push(this.accounts[i]);
      }
      if (await this.Marketplace.storeOwners(this.accounts[i])) {
        storeOwners.push(this.accounts[i]);
      }
    }
    if (admins.length === 1) {
      this.admin = admins[0];
    }
    if (storeOwners.length === 1) {
      this.storeOwner = storeOwners[0];
    }
    this.owner = owner;
    this.admins = admins;
    this.storeOwners = storeOwners;
  }

  isAddress(address: string): boolean {
    return this.web3.utils.isAddress(address);
  }

  async isAdmin(address: string) {
    if (this.Marketplace === undefined) {
      return false;
    }
    return await this.Marketplace.admins(address);
  }

  async isStoreOwner(address: string) {
    if (this.Marketplace === undefined) {
      return false;
    }
    return await this.Marketplace.storeOwners(address);
  }

  addAdmin(address: string) {
    this.Marketplace.addAdmin(address, { from: this.owner });
  }

  removeAdmin(address: string) {
    this.Marketplace.removeAdmin(address, { from: this.owner });
  }

  addStoreOwner(address: string) {
    if (this.admin === undefined) {
      throw new Error('no admin account set');
    }
    this.Marketplace.addStoreOwner(address, { from: this.admin });
  }

  removeStoreOwner(address: string) {
    if (this.admin === undefined) {
      throw new Error('no admin account set');
    }
    this.Marketplace.removeStoreOwner(address, { from: this.admin });
  }

  async addStore(name: string, description: string) {
    const gas = await this.Marketplace.addStore.estimateGas(name, description, {
      from: this.storeOwner
    });
    return this.Marketplace.addStore(name, description, {
      from: this.storeOwner,
      gas: gas
    });
  }

  async removeStore(id: string) {
    const gas = await this.Marketplace.removeStore.estimateGas(id, {
      from: this.storeOwner
    });
    await this.Marketplace.removeStore(id, {
      from: this.storeOwner,
      gas: gas
    });
  }

  async addItem(
    id: string,
    name: string,
    description: string,
    price: any,
    image: string,
    stock: number
  ) {
    const gas = await this.Marketplace.addItem.estimateGas(
      id,
      name,
      description,
      price,
      image,
      stock,
      {
        from: this.storeOwner
      }
    );
    return this.Marketplace.addItem(
      id,
      name,
      description,
      price,
      image,
      stock,
      {
        from: this.storeOwner,
        gas: gas
      }
    );
  }

  async removeItem(storeID: string, itemID: string) {
    const gas = await this.Marketplace.removeItem.estimateGas(storeID, itemID, {
      from: this.storeOwner
    });
    return this.Marketplace.removeItem(storeID, itemID, {
      from: this.storeOwner,
      gas: gas
    });
  }

  async getStores(address?: string) {
    let storeOwner;
    if (address) {
      if (this.Marketplace === undefined) {
        return;
      }
      storeOwner = address;
    } else {
      if (this.Marketplace === undefined || this.storeOwner === undefined) {
        return;
      }
      storeOwner = this.storeOwner;
    }
    const stores = new Stores();
    const storeIdList: string[] = await this.Marketplace.getStoreIdList(
      storeOwner
    );

    for (let i = 0; i < storeIdList.length; i++) {
      const storeID = storeIdList[i];
      const result: any[] = await this.Marketplace.getStore(
        storeOwner,
        storeID
      );

      stores[storeIdList[i]] = {
        name: result[0],
        description: result[1],
        itemIdList: result[2],
        index: result[3].toString(),
        active: result[4]
      };
    }
    return { stores: stores, storeIdList: storeIdList };
  }

  async getItems(storeID: string, address?: string) {
    let storeOwner;
    if (address) {
      if (this.Marketplace === undefined) {
        return;
      }
      storeOwner = address;
    } else {
      if (this.Marketplace === undefined || this.storeOwner === undefined) {
        return;
      }
      storeOwner = this.storeOwner;
    }
    const items = new Items();
    const itemIdList: string[] = await this.Marketplace.getItemIdList(
      storeOwner,
      storeID
    );
    for (let i = 0; i < itemIdList.length; i++) {
      const itemID = itemIdList[i];
      const result: any[] = await this.Marketplace.getItem(
        storeOwner,
        storeID,
        itemID
      );

      items[itemIdList[i]] = {
        name: result[0],
        description: result[1],
        image: result[2],
        price: result[3],
        stock: result[4],
        index: result[5],
        active: result[6]
      };
    }
    return { items: items, itemIdList: itemIdList };
  }

  async getStore(id: string, address?: string) {
    let storeOwner;
    if (address) {
      if (this.Marketplace === undefined) {
        throw new Error('Marketplace contract is not setup');
      }
      storeOwner = address;
    } else {
      if (this.Marketplace === undefined || this.storeOwner === undefined) {
        throw new Error('no store owner account set');
      }
      storeOwner = this.storeOwner;
    }
    return await this.Marketplace.getStore(storeOwner, id);
  }

  async getItem(storeID: string, itemID: string, address?: string) {
    let storeOwner;
    if (address) {
      if (this.Marketplace === undefined) {
        throw new Error('Marketplace contract is not setup');
      }
      storeOwner = address;
    } else {
      if (this.Marketplace === undefined || this.storeOwner === undefined) {
        throw new Error('no store owner account set');
      }
      storeOwner = this.storeOwner;
    }
    return await this.Marketplace.getItem(storeOwner, storeID, itemID);
  }

  async getBalance() {
    if (this.Marketplace === undefined || this.storeOwner === undefined) {
      throw new Error('no store owner account set');
    }
    return await this.Marketplace.balances(this.storeOwner);
  }

  async withdraw() {
    if (this.Marketplace === undefined || this.storeOwner === undefined) {
      throw new Error('no store owner account set');
    }
    return this.Marketplace.withdraw({ from: this.storeOwner });
  }

  async restock(storeID: string, itemID: string, amount: string) {
    if (this.Marketplace === undefined || this.storeOwner === undefined) {
      throw new Error('no store owner account set');
    }
    return this.Marketplace.restock(storeID, itemID, amount, {
      from: this.storeOwner
    });
  }

  async changePrice(storeID: string, itemID: string, newPrice: string) {
    if (this.Marketplace === undefined || this.storeOwner === undefined) {
      throw new Error('no store owner account set');
    }
    return this.Marketplace.changePrice(storeID, itemID, newPrice, {
      from: this.storeOwner
    });
  }

  async setFeaturedStoreOwners() {
    if (this.Marketplace === undefined) {
      throw new Error('Marketplace contract is not setup');
    }
    for (let i = 0; i < 10; i++) {
      const address = await this.Marketplace.featuredStoreOwners(i);
      if (address !== '0x0000000000000000000000000000000000000000') {
        this.featuredStoreOwners.push(address);
      }
    }
  }
  async purchase(
    storeOwner: string,
    storeID: string,
    itemID: string,
    price: string
  ) {
    if (this.Marketplace === undefined || this.customer === undefined) {
      throw new Error('no customer account set');
    }
    return this.Marketplace.purchase(storeOwner, storeID, itemID, {
      from: this.customer,
      value: price
    });
  }
}
