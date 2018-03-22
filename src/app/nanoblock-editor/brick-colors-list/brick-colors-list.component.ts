import {
  Component, OnInit, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges,
  ElementRef, ViewChild, HostListener, Renderer2
} from '@angular/core';
import { BrickColor, Brick } from '../editor/editor.models';
import { BrickColorService, DEFAULT_BRICK_COLOR_HEX } from '../brick-color.service';

@Component({
  selector: 'ne-brick-colors-list',
  templateUrl: './brick-colors-list.component.html',
  styleUrls: ['./brick-colors-list.component.scss']
})
export class BrickColorsListComponent implements OnInit {
  @ViewChild('colorPickerContainer')
  private _colorPickerContainer: ElementRef;

  @Input() currentBrickColor: BrickColor;
  @Output() currentBrickColorChange = new EventEmitter<BrickColor>();

  @Output() brickColorChange = new EventEmitter<BrickColor>();
  @Output() brickColorDelete = new EventEmitter<BrickColor>();

  @Input() brickColors: BrickColor[];

  private _showColorPickerContainer = false;

  get showColorPickerContainer(): boolean {
    return this._showColorPickerContainer;
  }

  set showColorPickerContainer(v: boolean) {
    this._showColorPickerContainer = v;
  }

  constructor(private _renderer: Renderer2, private _brickColorService: BrickColorService) {
  }

  ngOnInit() {
  }

  onColorPickerChanged(brickColor: BrickColor) {
    this._brickColorService.updateBrickColorMaterial(brickColor);

    this.brickColorChange.emit(brickColor);
  }

  onBrickColorChanged(brickColor: BrickColor) {
    this.currentBrickColor = brickColor;
    this.currentBrickColorChange.emit(this.currentBrickColor);
  }

  onBrickColorClicked(event, brickColor: BrickColor) {
    if (this.currentBrickColor === brickColor) {
      this.showColorPickerContainer = !this.showColorPickerContainer;
    }
  }

  onAddButtonClick() {
    const brickColor = new BrickColor();

    brickColor.colorHex = DEFAULT_BRICK_COLOR_HEX;
    brickColor.isClear = false;
    brickColor.id = this.getNewBrickColorId();
    brickColor.name = `new color ${brickColor.id}`;

    this.brickColors.push(brickColor);

    this.currentBrickColor = brickColor;
    this.showColorPickerContainer = true;
  }

  onDeleteButtonClick() {
    if (this.brickColors.length < 2) {
      return;
    }

    const deleteBrickColor = this.currentBrickColor;

    const deleteBrickColorIndex = this.brickColors.indexOf(deleteBrickColor);

    const newSelectedBrickColorIndex = deleteBrickColorIndex === this.brickColors.length - 1 ?
      deleteBrickColorIndex - 1 :
      deleteBrickColorIndex + 1;

    this.currentBrickColor = this.brickColors[newSelectedBrickColorIndex];

    this.brickColorDelete.emit(deleteBrickColor);
  }

  private getNewBrickColorId(): number {
    return Math.max.apply(Math, this.brickColors.map(function (x) { return x.id; })) + 1;
  }

  onColorClearChanged(isClear: boolean) {
    this.currentBrickColor.isClear = isClear;

    this._brickColorService.updateBrickColorMaterial(this.currentBrickColor);
  }
}
