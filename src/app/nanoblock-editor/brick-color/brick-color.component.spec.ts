import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickColorComponent } from './brick-color.component';

describe('BrickColorComponent', () => {
  let component: BrickColorComponent;
  let fixture: ComponentFixture<BrickColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrickColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrickColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
