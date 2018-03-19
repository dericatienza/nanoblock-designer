import { Component, OnInit, Input } from '@angular/core';
import { EditorMode } from '../editor/editor-mode';

@Component({
  selector: 'ne-editor-mode',
  templateUrl: './editor-mode.component.html',
  styleUrls: ['./editor-mode.component.scss']
})
export class EditorModeComponent implements OnInit {
  @Input()
  modes: EditorMode[];

  constructor() { }

  ngOnInit() {
  }

}
