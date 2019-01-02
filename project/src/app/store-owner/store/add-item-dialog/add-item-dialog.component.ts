import { Component, OnInit } from '@angular/core';
import { MatDialogRef, ErrorStateMatcher } from '@angular/material';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { SmartContractService } from '../../../smart-contract.service';

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
  selector: 'app-add-item-dialog',
  templateUrl: './add-item-dialog.component.html',
  styleUrls: ['./add-item-dialog.component.css']
})
export class AddItemDialogComponent {
  matcher: MyErrorStateMatcher;
  addControl: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddItemDialogComponent>,
    private smartContract: SmartContractService
  ) {
    this.matcher = new MyErrorStateMatcher();
    this.addControl = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      price: new FormControl('', [
        Validators.required,
        this.positiveValidator.bind(this)
      ]),
      image: new FormControl('', [Validators.required]),
      stock: new FormControl('', [
        Validators.required,
        this.stockValidator.bind(this),
        this.positiveValidator.bind(this)
      ])
    });
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
