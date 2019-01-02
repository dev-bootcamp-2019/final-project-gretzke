import { Component, OnInit, OnDestroy } from '@angular/core';
import { SmartContractService, Stores } from '../smart-contract.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { AddStoreDialogComponent } from './add-store-dialog/add-store-dialog.component';

@Component({
  selector: 'app-store-owner',
  templateUrl: './store-owner.component.html',
  styleUrls: ['./store-owner.component.css']
})
export class StoreOwnerComponent implements OnInit, OnDestroy {
  stores: Stores;
  storeIdList: string[] = [];
  balance: number;
  storeInterval: any;

  constructor(
    public smartContract: SmartContractService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.storeInterval = setInterval(() => {
      this.getStores();
      this.getBalance();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.storeInterval) {
      clearInterval(this.storeInterval);
    }
  }

  async getStores() {
    const result = await this.smartContract.getStores();
    if (result !== undefined) {
      this.stores = result.stores;
      this.storeIdList = result.storeIdList;
    }
  }

  async getBalance() {
    if (this.smartContract.storeOwner !== undefined) {
      const balance = await this.smartContract.getBalance();
      this.balance = this.smartContract.web3.utils.fromWei(
        balance.toString(),
        'ether'
      );
    }
  }

  addStore() {
    const dialogRef = this.dialog.open(AddStoreDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        try {
          this.smartContract.addStore(result.name, result.description);
          this.snackBar.open(
            'Transaction was sent successfully, store will be added, once transaction has been mined',
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
}
