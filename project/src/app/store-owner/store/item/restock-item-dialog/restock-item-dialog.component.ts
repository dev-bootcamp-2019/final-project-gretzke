import { Component } from '@angular/core';
import { ErrorStateMatcher, MatDialogRef } from '@angular/material';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  AbstractControl,
  Validators
} from '@angular/forms';
import { SmartContractService } from '../../../../smart-contract.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-restock-item-dialog',
  templateUrl: './restock-item-dialog.component.html',
  styleUrls: ['./restock-item-dialog.component.css']
})
export class RestockItemDialogComponent {
  matcher: MyErrorStateMatcher;
  restockControl: FormControl;

  constructor(
    public dialogRef: MatDialogRef<RestockItemDialogComponent>,
    private smartContract: SmartContractService
  ) {
    this.matcher = new MyErrorStateMatcher();
    this.restockControl = new FormControl('', [
      Validators.required,
      this.stockValidator.bind(this),
      this.positiveValidator.bind(this)
    ]);
  }

  stockValidator(control: AbstractControl): { [key: string]: boolean } | null {
    // convert price to wei and check if number is valid
    try {
      this.smartContract.web3.utils.toBN(control.value.toString());
      return null;
    } catch (e) {
      return { 'stock invalid': true };
    }
  }

  positiveValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    if (control.value < 0) {
      return { 'value negative': true };
    }
    return null;
  }

  close() {
    this.dialogRef.close();
  }
}
