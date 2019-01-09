import { Component, OnInit } from '@angular/core';
import { SmartContractService, Stores } from '../../smart-contract.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-c-storeowner',
  templateUrl: './c-storeowner.component.html',
  styleUrls: ['./c-storeowner.component.css']
})
export class CStoreownerComponent implements OnInit {
  stores: Stores;
  storeIdList: string[] = [];
  storeOwner: string;

  constructor(
    public smartContract: SmartContractService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.storeOwner = params.address;
      this.getStores(params.address);
    });
  }

  async getStores(address: string) {
    const result = await this.smartContract.getStores(address);
    if (result !== undefined) {
      this.stores = result.stores;
      this.storeIdList = result.storeIdList;
    }
  }
  ngOnInit() {}
}
