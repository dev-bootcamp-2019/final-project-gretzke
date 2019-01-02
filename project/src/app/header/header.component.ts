import { Component, OnInit } from '@angular/core';
import { SmartContractService } from '../smart-contract.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(
    public smartContract: SmartContractService,
    public router: Router
  ) {}

  navigate(route: string) {
    if (route === '/owner') {
      if (this.smartContract.owner === undefined) {
        return;
      }
    } else if (route === '/admin') {
      if (this.smartContract.admins.length === 0) {
        return;
      }
    } else if (route === '/storeowner') {
      if (this.smartContract.storeOwners.length === 0) {
        return;
      }
    }
    this.router.navigate([route]);
  }
}
