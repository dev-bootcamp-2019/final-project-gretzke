import { Component } from '@angular/core';
import { MatDialogRef, ErrorStateMatcher } from '@angular/material';
import {
  FormControl,
  FormGroupDirective,
  NgForm,
  FormGroup,
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
  selector: 'app-store-add-dialog',
  templateUrl: './add-store-dialog.component.html',
  styleUrls: ['./add-store-dialog.component.css']
})
export class AddStoreDialogComponent {
  matcher: MyErrorStateMatcher;
  addControl: FormGroup;
  constructor(public dialogRef: MatDialogRef<AddStoreDialogComponent>) {
    this.matcher = new MyErrorStateMatcher();
    this.addControl = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required])
    });
  }

  close() {
    this.dialogRef.close();
  }
}
