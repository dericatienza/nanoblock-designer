import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorModeComponent } from './editor-mode.component';

describe('EditorModeComponent', () => {
  let component: EditorModeComponent;
  let fixture: ComponentFixture<EditorModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditorModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
