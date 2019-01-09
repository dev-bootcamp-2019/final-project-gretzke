import { Component, OnInit } from '@angular/core';
import { SmartContractService } from '../smart-contract.service';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  Validators,
  AbstractControl
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { Router } from '@angular/router';

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
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent {
  matcher: MyErrorStateMatcher;
  storeOwnerControl: FormControl;

  constructor(
    public smartContract: SmartContractService,
    private router: Router
  ) {
    this.matcher = new MyErrorStateMatcher();
    this.storeOwnerControl = new FormControl('', [
      Validators.required,
      Validators.minLength(42),
      this.addressValidator.bind(this)
    ]);
  }

  validateAddress(): boolean {
    return (
      (this.storeOwnerControl.hasError('address invalid') ||
        this.storeOwnerControl.hasError('minlength')) &&
      !this.storeOwnerControl.hasError('required')
    );
  }

  addressValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    if (this.smartContract.isAddress(control.value)) {
      return null;
    }
    return { 'address invalid': true };
  }

  navigate(address: string) {
    this.router.navigate([address]);
  }
}
