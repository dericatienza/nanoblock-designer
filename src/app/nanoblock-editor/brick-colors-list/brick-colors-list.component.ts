import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { BrickColor, Brick } from '../editor/editor.models';
import { BrickColorService } from '../brick-color.service';

@Component({
  selector: 'ne-brick-colors-list',
  templateUrl: './brick-colors-list.component.html',
  styleUrls: ['./brick-colors-list.component.scss']
})
export class BrickColorsListComponent implements OnInit, OnChanges {
  @Output() selectionChange = new EventEmitter<BrickColor>();
  @Output() brickColorChange = new EventEmitter<BrickColor>();

  @Input() brickColors: BrickColor[];

  private _selectedBrickColor: BrickColor;

  get selectedBrickColor(): BrickColor {
    return this._selectedBrickColor;
  }

  set selectedBrickColor(v: BrickColor) {
    this._selectedBrickColor = v;

    this.onChange(this.selectedBrickColor);
  }

  constructor(private _brickColorService: BrickColorService) { }

  ngOnInit() {
  }

  onColorPickerChanged(brickColor: BrickColor) {
    this._brickColorService.updateBrickColorMaterial(brickColor);

    this.brickColorChange.emit(brickColor);
  }

  onChange(brickColor: BrickColor) {
    this.selectionChange.emit(brickColor);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const brickColors = changes.brickColors;

    if (brickColors.currentValue && brickColors.isFirstChange) {
      this.selectedBrickColor = brickColors.currentValue[0];
    }
  }
}
