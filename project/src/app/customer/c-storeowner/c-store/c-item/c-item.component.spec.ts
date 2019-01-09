import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CItemComponent } from './c-item.component';

describe('CItemComponent', () => {
  let component: CItemComponent;
  let fixture: ComponentFixture<CItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
