import {
  Component, OnInit, Input, Output, EventEmitter,
  ViewChildren, QueryList, AfterViewInit, ViewChild, ElementRef
} from '@angular/core';
import { BrickType, BrickColor } from '../editor/editor.models';
import { BrickTypeComponent } from '../brick-type/brick-type.component';
import * as THREE from 'three';

@Component({
  selector: 'ne-brick-types-list',
  templateUrl: './brick-types-list.component.html',
  styleUrls: ['./brick-types-list.component.scss']
})
export class BrickTypesListComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas')
  private canvasRef: ElementRef;

  @ViewChildren('brickTypes')
  brickTypeComponents: QueryList<BrickTypeComponent>;

  @Input() currentBrickType: BrickType;
  @Output() currentBrickTypeChange = new EventEmitter<BrickType>();

  @Input() brickTypes: BrickType[];

  private _brickColor: BrickColor;

  private _renderer: THREE.WebGLRenderer;

  get brickColor(): BrickColor {
    return this._brickColor;
  }

  @Input()
  set brickColor(v: BrickColor) {
    this._brickColor = v;

    if (this.brickTypeComponents) {
      this.brickTypeComponents.forEach((x) => x.brickColor = this._brickColor);

      this.render();
    }
  }

  constructor() {
    this.render = this.render.bind(this);
  }

  ngOnInit() {
    this._renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });

    this._renderer.setPixelRatio(devicePixelRatio);

    this._renderer.shadowMap.enabled = true;
    this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this._renderer.setClearColor('white', 0);
    this._renderer.autoClear = true;
  }

  onBrickTypeChanged(brickType: BrickType) {
    this.currentBrickType = brickType;
    this.currentBrickTypeChange.emit(this.currentBrickType);
  }

  ngAfterViewInit() {
    this.render();
  }

  public render() {
    if (this.brickTypeComponents) {
      this.brickTypeComponents.forEach(bc => bc.render(this._renderer));
    }
  }
}
