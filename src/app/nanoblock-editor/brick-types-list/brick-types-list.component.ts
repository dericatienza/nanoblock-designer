import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { BrickType, BrickColor } from '../editor/editor.models';
import { BrickTypeComponent } from '../brick-type/brick-type.component';

@Component({
  selector: 'ne-brick-types-list',
  templateUrl: './brick-types-list.component.html',
  styleUrls: ['./brick-types-list.component.scss']
})
export class BrickTypesListComponent implements OnInit {
  @ViewChildren('brickTypes')
  brickTypeComponents: QueryList<BrickTypeComponent>;

  @Output() selectionChange = new EventEmitter<BrickType>();

  @Input() brickTypes: BrickType[];

  private _brickColor: BrickColor;

  get brickColor(): BrickColor {
    return this._brickColor;
  }

  @Input()
  set brickColor(v: BrickColor) {
    this._brickColor = v;

    if (this.brickTypeComponents) {
      this.brickTypeComponents.forEach((x) => x.brickColor = this._brickColor);
    }
  }

  constructor() { }

  ngOnInit() {
  }

  onChange(brickType: BrickType) {
    this.selectionChange.emit(brickType);
  }
}
