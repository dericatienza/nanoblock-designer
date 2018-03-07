import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickColorsListComponent } from './brick-colors-list.component';

describe('BrickColorsListComponent', () => {
  let component: BrickColorsListComponent;
  let fixture: ComponentFixture<BrickColorsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrickColorsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrickColorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
