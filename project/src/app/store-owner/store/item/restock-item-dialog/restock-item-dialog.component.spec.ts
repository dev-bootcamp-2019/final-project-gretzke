import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RestockItemDialogComponent } from './restock-item-dialog.component';

describe('RestockItemDialogComponent', () => {
  let component: RestockItemDialogComponent;
  let fixture: ComponentFixture<RestockItemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RestockItemDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestockItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
