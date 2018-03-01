import { Directive, ContentChildren, QueryList, AfterViewInit, Input, forwardRef, Output, EventEmitter, OnInit } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from '../../three-js/objects/index';
import { RendererComponent } from '../../three-js/renderer/renderer.component';
import { AbstractCamera } from '../../three-js/cameras/index';
import { Vector3, Object3D } from 'three';
import { MathHelper } from '../../helpers/math-helper';
import { GridDirective, Cell } from './grid.directive';

@Directive({
  selector: 'ne-grid-selector',
  exportAs: 'ne-grid-selector'
})
export class GridSelectorDirective implements OnInit, AfterViewInit {
  @Input() camera: AbstractCamera<THREE.Camera>;
  @Input() grid: GridDirective;
  @Input() renderer: RendererComponent;

  @Output() highlight = new EventEmitter<Cell>();
  @Output() select = new EventEmitter<Cell>();

  private _raycaster = new THREE.Raycaster();
  private _mousePosition = new THREE.Vector2();

  private _highlightedCell: Cell;

  private _selectableObjects: Object3D[];

  get selectableObjects(): Object3D[] {
    return this._selectableObjects;
  }

  get highlightedCell(): Cell {
    return this._highlightedCell;
  }

  constructor() {
  }

  ngOnInit(): void {
    this._selectableObjects = [];
  }

  ngAfterViewInit(): void {
    this._selectableObjects.push(this.grid.selectorMesh);

    this.renderer.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.renderer.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private getCellOnMouse(event: MouseEvent): Cell {
    this._mousePosition.x = (event.clientX / this.renderer.canvas.clientWidth) * 2 - 1;
    this._mousePosition.y = - (event.clientY / this.renderer.canvas.clientHeight) * 2 + 1;
    this._raycaster.setFromCamera(this._mousePosition, this.camera.camera);

    const intersects = this._raycaster.intersectObjects(this._selectableObjects);

    if (intersects.length > 0) {
      const intersectPoint = intersects[0].point;
      const cell = this.grid.getCellFromWorldPosition(intersectPoint);

      return cell;
    } else {
      return null;
    }
  }

  onMouseMove(event: MouseEvent): any {
    const cell = this.getCellOnMouse(event);

    if (cell) {
      if (this._highlightedCell !== cell) {
        this._highlightedCell = cell;

        this.highlight.emit(this._highlightedCell);
      }
    }
  }

  onMouseUp(event: MouseEvent): any {
    const cell = this.getCellOnMouse(event);
    if (cell) {
      this.select.emit(cell);
    }
  }

  addSelectable(object: Object3D) {
    this._selectableObjects.push(object);
  }

  removeSelectable(object: Object3D) {
    const index = this._selectableObjects.indexOf(object);

    if (index < 0) {
      return;
    }

    this._selectableObjects.splice(index, 1);
  }
}
