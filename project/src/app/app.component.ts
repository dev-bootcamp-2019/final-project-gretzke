import { Component } from '@angular/core';
import { SmartContractService } from './smart-contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public smartContract: SmartContractService) {
    this.connect();
  }

  async connect() {
    // try to connect to a local development blockchain first for easier demonstration purpose
    // if it isn't available try using injected web3
    // if both aren't available alert user
    if (!(await this.smartContract.localWeb3())) {
      if (!(await this.smartContract.injectedWeb3())) {
        alert(
          'You need to use a web3 enabled browser to use this website. Please consider downloading Metamask'
        );
        return;
      }
    }

    // connect to rinkeby or local smart contract
    switch (await this.smartContract.getNetworkVersion()) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 42:
        alert(
          'You need to either use the rinkeby testnet or a local development blockchain'
        );
        break;
      case 4:
        console.log('Using rinkeby network');
        if (!(await this.smartContract.setContract())) {
          alert(
            'There was something wrong with setting up the rinkeby contract, please try again'
          );
        }
        break;
      default:
        console.log('Most likely using local development blockchain');
        // if local blockchain wasn't set up correctly, set contract up properly
        if (!(await this.smartContract.setContract())) {
          alert('No contract set up! Please read Readme to set up smart contract correctly');
        }
        this.smartContract.setFeaturedStoreOwners();
        break;
    }

    // start polling accounts
    // accounts need to be monitored, because metamask only has one active account at a time
    setInterval(() => {
      this.smartContract.getAccounts();
    }, 1000);
  }
}
