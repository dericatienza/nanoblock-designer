import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BrickType } from '../editor/editor.models';

@Component({
  selector: 'ne-brick-types-list',
  templateUrl: './brick-types-list.component.html',
  styleUrls: ['./brick-types-list.component.scss']
})
export class BrickTypesListComponent implements OnInit {

  @Output() selectionChange = new EventEmitter<number>();

  @Input() brickTypes: BrickType[];

  constructor() { }

  ngOnInit() {
  }

  onChange(id: number) {
    this.selectionChange.emit(id);
  }
}
