import { Component, OnDestroy } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { SmartContractService, Item } from '../../../smart-contract.service';
import { Router, ActivatedRoute } from '@angular/router';
import { RestockItemDialogComponent } from './restock-item-dialog/restock-item-dialog.component';
import { ChangePriceDialogComponent } from './change-price-dialog/change-price-dialog.component';

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

  restockItem() {
    const dialogRef = this.dialog.open(RestockItemDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        try {
          const stock = result;
          this.smartContract.restock(this.storeID, this.itemID, stock);
          this.snackBar.open(
            'Transaction was sent successfully, item will be added, once transaction has been mined',
            'OK'
          );
        } catch (e) {
          console.warn(e);
          this.snackBar.open(
            'There was an error sending the transaction, check console logs for more information',
            'OK'
          );
        }
      }
    });
  }
  changePrice() {
    const dialogRef = this.dialog.open(ChangePriceDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        try {
          const price = this.smartContract.web3.utils.toWei(
            result.toString(),
            'ether'
          );
          this.smartContract.changePrice(
            this.storeID,
            this.itemID,
            price.toString()
          );
          this.snackBar.open(
            'Transaction was sent successfully, item will be added, once transaction has been mined',
            'OK'
          );
        } catch (e) {
          console.warn(e);
          this.snackBar.open(
            'There was an error sending the transaction, check console logs for more information',
            'OK'
          );
        }
      }
    });
  }

  async removeItem() {
    try {
      await this.smartContract.removeItem(this.storeID, this.itemID);
      this.snackBar.open(
        'Transaction was sent successfully, store will be removed, once transaction has been mined',
        'OK'
      );
      this.router.navigate(['/storeowner', this.storeID]);
    } catch (e) {
      console.warn(e);
      this.snackBar.open(
        'There was an error sending the transaction, check console logs for more information',
        'OK'
      );
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
