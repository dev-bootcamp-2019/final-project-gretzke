import { Component } from '@angular/core';
import { ErrorStateMatcher, MatDialogRef } from '@angular/material';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  AbstractControl,
  Validators
} from '@angular/forms';

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
  selector: 'app-change-price-dialog',
  templateUrl: './change-price-dialog.component.html',
  styleUrls: ['./change-price-dialog.component.css']
})
export class ChangePriceDialogComponent {
  matcher: MyErrorStateMatcher;
  priceChangeControl: FormControl;

  constructor(public dialogRef: MatDialogRef<ChangePriceDialogComponent>) {
    this.matcher = new MyErrorStateMatcher();
    this.priceChangeControl = new FormControl('', [
      Validators.required,
      this.positiveValidator.bind(this)
    ]);
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
