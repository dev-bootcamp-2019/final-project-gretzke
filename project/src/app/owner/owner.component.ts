import { Component } from '@angular/core';
import {
  FormControl,
  Validators,
  AbstractControl,
  FormGroupDirective,
  NgForm
} from '@angular/forms';
import { SmartContractService } from '../smart-contract.service';
import { ErrorStateMatcher } from '@angular/material';

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
  selector: 'app-owner',
  templateUrl: './owner.component.html',
  styleUrls: ['./owner.component.css']
})
export class OwnerComponent {
  matcher: MyErrorStateMatcher;
  addControl: FormControl;
  removeControl: FormControl;
  checkControl: FormControl;

  constructor(public smartContract: SmartContractService) {
    this.matcher = new MyErrorStateMatcher();
    this.addControl = new FormControl('', [
      Validators.required,
      Validators.minLength(42),
      Validators.maxLength(42),
      this.addressValidator.bind(this)
    ]);
    this.removeControl = new FormControl('', [
      Validators.required,
      Validators.minLength(42),
      this.addressValidator.bind(this)
    ]);
    this.checkControl = new FormControl(
      '',
      [Validators.required, Validators.minLength(42)],
      [this.adminValidator.bind(this)]
    );
  }

  addAdmin() {
    const input = document.getElementById('add') as HTMLInputElement;
    this.smartContract.addAdmin(input.value);
  }

  removeAdmin() {
    const input = document.getElementById('remove') as HTMLInputElement;
    this.smartContract.removeAdmin(input.value);
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

  async adminValidator(control: AbstractControl) {
    if (this.smartContract.isAddress(control.value)) {
      if (await this.smartContract.isAdmin(control.value)) {
        return null;
      } else {
        return { 'not admin': true };
      }
    } else {
      return { 'address invalid': true };
    }
  }
}
