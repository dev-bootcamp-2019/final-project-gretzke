import { Component, OnInit } from '@angular/core';
import { SmartContractService } from '../smart-contract.service';
import { ErrorStateMatcher } from '@angular/material';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  AbstractControl
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
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  matcher: MyErrorStateMatcher;
  addControl: FormControl;
  removeControl: FormControl;
  checkControl: FormControl;

  constructor(public smartContract: SmartContractService) {
    this.matcher = new MyErrorStateMatcher();
    this.addControl = new FormControl('', [
      Validators.required,
      Validators.minLength(42),
      this.addressValidator.bind(this),
      this.adminValidator.bind(this)
    ]);
    this.removeControl = new FormControl('', [
      Validators.required,
      Validators.minLength(42),
      this.addressValidator.bind(this),
      this.adminValidator.bind(this)
    ]);
    this.checkControl = new FormControl(
      '',
      [Validators.required, Validators.minLength(42)],
      [this.storeOwnerValidator.bind(this)]
    );
  }

  addStoreOwner() {
    const input = document.getElementById('add') as HTMLInputElement;
    this.smartContract.addStoreOwner(input.value);
  }

  removeStoreOwner() {
    const input = document.getElementById('remove') as HTMLInputElement;
    this.smartContract.removeStoreOwner(input.value);
  }

  validateAddress(type: string): boolean {
    if (type === 'add') {
      return (
        (this.addControl.hasError('address invalid') ||
          this.addControl.hasError('minlength')) &&
        !this.addControl.hasError('required')
      );
    }
    if (type === 'remove') {
      return (
        (this.removeControl.hasError('address invalid') ||
          this.removeControl.hasError('minlength')) &&
        !this.removeControl.hasError('required')
      );
    }
    if (type === 'check') {
      return (
        (this.checkControl.hasError('address invalid') ||
          this.checkControl.hasError('minlength')) &&
        !this.checkControl.hasError('required')
      );
    }
    return false;
  }

  addressValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    if (this.smartContract.isAddress(control.value)) {
      return null;
    }
    return { 'address invalid': true };
  }

  adminValidator(control: AbstractControl) {
    if (this.smartContract.admin === undefined) {
      return { 'admin not set': true };
    }
    return null;
  }

  async storeOwnerValidator(control: AbstractControl) {
    if (this.smartContract.isAddress(control.value)) {
      if (await this.smartContract.isStoreOwner(control.value)) {
        return null;
      } else {
        return { 'not store owner': true };
      }
    } else {
      return { 'address invalid': true };
    }
  }
}
