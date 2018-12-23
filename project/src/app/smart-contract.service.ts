import {Injectable} from '@angular/core';
import * as Web3 from 'web3';

declare let require: any;
declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class SmartContractService {
  private web3: any;

  constructor() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // console.log(Web3);
      // this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      //   // Use Mist/MetaMask's provider
      //   this.web3 = new Web3(window.web3.currentProvider);
      // } else {
      //   console.log('No web3? You should consider trying MetaMask!');
      //   // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      //   Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      //   this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
  }
}
