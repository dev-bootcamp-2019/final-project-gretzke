import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SmartContractService, Item } from '../../../../smart-contract.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-c-item',
  templateUrl: './c-item.component.html',
  styleUrls: ['./c-item.component.css']
})
export class CItemComponent implements OnDestroy {
  storeOwner: string;
  storeID: string;
  itemID: string;
  item: Item;
  interval: any;

  constructor(
    private route: ActivatedRoute,
    public smartContract: SmartContractService,
    private snackBar: MatSnackBar
  ) {
    this.route.params.subscribe(params => {
      this.storeOwner = params.address;
      this.storeID = params.storeID;
      this.itemID = params.itemID;
      this.interval = setInterval(() => {
        this.smartContract
          .getItem(this.storeID, this.itemID, this.storeOwner)
          .then(result => {
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
      }, 1000);
    });
  }

  itemPrice() {
    return this.smartContract.web3.utils.fromWei(
      this.item.price.toString(),
      'ether'
    );
  }

  async purchase() {
    this.smartContract
      .purchase(
        this.storeOwner,
        this.storeID,
        this.itemID,
        this.item.price.toString()
      )
      .then(() => {
        this.snackBar.open(
          'Transaction was completed successfully, item was purchased',
          'OK'
        );
      })
      .catch(e => {
        console.warn(e);
        this.snackBar.open(
          'There was an error with the transaction, check console logs for more information',
          'OK'
        );
      });
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
