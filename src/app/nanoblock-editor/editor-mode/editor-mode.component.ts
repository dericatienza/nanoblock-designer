import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { EditorMode } from '../editor/editor-mode';

@Component({
  selector: 'ne-editor-mode',
  templateUrl: './editor-mode.component.html',
  styleUrls: ['./editor-mode.component.scss']
})
export class EditorModeComponent implements OnInit {
  @Input()
  modes: EditorMode[];

  @Input()
  currentMode: EditorMode;
  @Output() currentModeChange = new EventEmitter<EditorMode>();

  constructor() { }

  ngOnInit() {
  }

  onChange(mode: EditorMode) {
    this.currentMode = mode;
    this.currentModeChange.emit(this.currentMode);
  }

  onModeChanged(mode: EditorMode) {
    this.onChange(mode);
  }
}
