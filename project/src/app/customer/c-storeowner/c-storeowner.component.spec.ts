import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CStoreownerComponent } from './c-storeowner.component';

describe('CStoreownerComponent', () => {
  let component: CStoreownerComponent;
  let fixture: ComponentFixture<CStoreownerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CStoreownerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CStoreownerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
