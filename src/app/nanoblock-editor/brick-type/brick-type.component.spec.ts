import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrickTypeComponent } from './brick-type.component';

describe('BrickTypeComponent', () => {
  let component: BrickTypeComponent;
  let fixture: ComponentFixture<BrickTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrickTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrickTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
