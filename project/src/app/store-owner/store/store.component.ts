import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SmartContractService,
  Store,
  Items
} from '../../smart-contract.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { AddItemDialogComponent } from './add-item-dialog/add-item-dialog.component';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent implements OnInit, OnDestroy {
  items: Items;
  itemInterval: any;
  storeID: string;
  store: Store;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    public smartContract: SmartContractService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.storeID = params.storeID;
      this.smartContract.getStore(this.storeID).then(result => {
        this.store = {
          name: result[0],
          description: result[1],
          itemIdList: result[2],
          index: result[3],
          active: result[4]
        };
        this.itemInterval = setInterval(() => {
          this.getItems();
        }, 1000);
      });
    });
  }

  ngOnDestroy() {
    if (this.itemInterval) {
      clearInterval(this.itemInterval);
    }
  }

  async getItems() {
    const result = await this.smartContract.getItems(this.storeID);
    if (result !== undefined) {
      this.items = result.items;
      this.store.itemIdList = result.itemIdList;
    }
  }

  async removeStore() {
    this.smartContract
      .removeStore(this.storeID)
      .then(() => {
        this.snackBar.open(
          'Transaction was completed successfully, store was removed',
          'OK'
        );
        this.router.navigate(['/storeowner']);
      })
      .catch(e => {
        console.warn(e);
        this.snackBar.open(
          'There was an error with the transaction, check console logs for more information',
          'OK'
        );
      });
  }

  async addItem() {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        const price = this.smartContract.web3.utils.toWei(
          result.price.toString(),
          'ether'
        );
        this.smartContract
          .addItem(
            this.storeID,
            result.name,
            result.description,
            price,
            result.image,
            result.stock
          )
          .then(() => {
            this.snackBar.open(
              'Transaction was completed successfully, item was added',
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
    });
  }
}
