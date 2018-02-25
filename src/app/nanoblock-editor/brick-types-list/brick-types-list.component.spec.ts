import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickTypesListComponent } from './brick-types-list.component';

describe('BrickTypesListComponent', () => {
  let component: BrickTypesListComponent;
  let fixture: ComponentFixture<BrickTypesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrickTypesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrickTypesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
