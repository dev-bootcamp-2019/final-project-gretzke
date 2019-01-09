import { Component, OnInit } from '@angular/core';
import {
  SmartContractService,
  Store,
  Items
} from '../../../smart-contract.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-c-store',
  templateUrl: './c-store.component.html',
  styleUrls: ['./c-store.component.css']
})
export class CStoreComponent {
  items: Items;
  storeOwner: string;
  storeID: string;
  store: Store;

  constructor(
    public smartContract: SmartContractService,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe(params => {
      this.storeOwner = params.address;
      this.storeID = params.storeID;

      this.smartContract
        .getStore(this.storeID, this.storeOwner)
        .then(result => {
          this.store = {
            name: result[0],
            description: result[1],
            itemIdList: result[2],
            index: result[3],
            active: result[4]
          };
          this.getItems();
        });
    });
  }

  async getItems() {
    const result = await this.smartContract.getItems(
      this.storeID,
      this.storeOwner
    );
    if (result !== undefined) {
      this.items = result.items;
      this.store.itemIdList = result.itemIdList;
    }
  }
}
