import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SmartContractService, Item } from '../../../smart-contract.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnDestroy {
  storeID: string;
  itemID: string;
  item: Item;
  interval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public smartContract: SmartContractService,
    public dialog: MatDialog
  ) {
    // TODO REMOVE
    if (this.smartContract.storeOwner === undefined) {
      this.router.navigate(['/storeowner']);
      return;
    }
    this.route.params.subscribe(params => {
      this.storeID = params.storeID;
      this.itemID = params.itemID;
      this.interval = setInterval(() => {
        this.getItem();
      }, 1000);
    });
  }

  getItem() {
    this.smartContract.getItem(this.storeID, this.itemID).then(result => {
      this.item = {
        name: result[0],
        description: result[1],
        image: result[2],
        price: result[3],
        stock: result[4],
        index: result[5],
        active: result[6]
      };
    });
  }

  itemPrice() {
    return this.smartContract.web3.utils.fromWei(
      this.item.price.toString(),
      'ether'
    );
  }

  restockItem() {}
  changePrice() {}
  removeItem() {}

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
