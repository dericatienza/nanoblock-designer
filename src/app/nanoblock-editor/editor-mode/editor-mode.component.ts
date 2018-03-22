import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { EditorMode } from '../editor/editor-mode';

declare var $: any;

interface $ {
  tooltip(options?: any): any;
}

@Component({
  selector: 'ne-editor-mode',
  templateUrl: './editor-mode.component.html',
  styleUrls: ['./editor-mode.component.scss']
})
export class EditorModeComponent implements OnInit, AfterViewInit {
  @Input()
  modes: EditorMode[];

  @Input()
  currentMode: EditorMode;
  @Output() currentModeChange = new EventEmitter<EditorMode>();

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    $('[data-toggle="tooltip"]').tooltip();
  }

  onChange(mode: EditorMode) {
    this.currentMode = mode;
    this.currentModeChange.emit(this.currentMode);
  }

  onModeChanged(mode: EditorMode) {
    this.onChange(mode);
  }
}
