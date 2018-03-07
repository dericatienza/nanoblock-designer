import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BrickColor } from '../editor/editor.models';

@Component({
  selector: 'ne-brick-colors-list',
  templateUrl: './brick-colors-list.component.html',
  styleUrls: ['./brick-colors-list.component.scss']
})
export class BrickColorsListComponent implements OnInit {
  @Output() selectionChange = new EventEmitter<BrickColor>();

  @Input() brickColors: BrickColor[];

  constructor() { }

  ngOnInit() {
  }

  onChange(brickColor: BrickColor) {
    this.selectionChange.emit(brickColor);
  }
}
