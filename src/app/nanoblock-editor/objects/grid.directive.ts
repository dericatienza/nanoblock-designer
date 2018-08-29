import { Directive, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { AbstractObject3D } from '../../three-js/objects/index';
import * as THREE from 'three';
import { MathHelper } from '../../helpers/math-helper';

// export const CELL_SIZE = 4;
export const CELL_SIZE = new THREE.Vector3(4, 3.5, 4);

export class Cell {
  x: number;
  y: number;
  z: number;

  worldPosition: THREE.Vector3;

  constructor(x: number, y: number, z: number, worldPosition: THREE.Vector3) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.worldPosition = worldPosition;
  }
}

@Directive({
  selector: 'ne-grid',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => GridDirective) }],
  exportAs: 'ne-grid'
})
export class GridDirective extends AbstractObject3D<THREE.GridHelper> {
  @Input() size: number;

  @Output() gridResize = new EventEmitter<number>();

  get width(): number {
    return this.size * CELL_SIZE.x;
  }

  get depth(): number {
    return this.size * CELL_SIZE.z;
  }

  private _cells: Cell[][][];

  get cells(): Cell[][][] {
    return this._cells;
  }

  private _selectorMesh: THREE.Mesh;

  get selectorMesh(): THREE.Mesh {
    return this._selectorMesh;
  }

  private _selectorMaterial = new THREE.MeshBasicMaterial({ color: 'red', side: THREE.BackSide, visible: false });

  private _gridHelper: THREE.GridHelper;

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.GridHelper {
    this._gridHelper = new THREE.GridHelper(this.size * CELL_SIZE.x, this.size);

    const selectorGeometry = new THREE.PlaneGeometry(this.width, this.depth);
    selectorGeometry.rotateX(THREE.Math.degToRad(90));

    this._selectorMesh = new THREE.Mesh(selectorGeometry, this._selectorMaterial);
    this._gridHelper.add(this._selectorMesh);

    return this._gridHelper;
  }

  protected afterInit(): void {
    this.initCells();
  }

  private initCells(): void {
    this._cells = [];

    const startX = -(this.width / 2) + CELL_SIZE.x / 2;
    const startZ = -(this.depth / 2) + CELL_SIZE.z / 2;
    const startY = 0;

    // Create cells at -1 Y to allow for highlighting and selecting beneath current bricks
    for (let y = -1; y < this.size; y++) {
      this._cells[y] = [];
      for (let z = 0; z < this.size; z++) {
        this._cells[y][z] = [];
        for (let x = 0; x < this.size; x++) {
          const position = new THREE.Vector3(
            startX + (CELL_SIZE.x * x),
            startY + (CELL_SIZE.y * y),
            startZ + (CELL_SIZE.z * z));

          this._cells[y][z][x] = new Cell(x, y, z, this.object.localToWorld(position));
        }
      }
    }
  }

  getCellFromWorldPosition(worldPosition: THREE.Vector3): Cell {
    const cellLocalPosition = this.selectorMesh.worldToLocal(worldPosition);

    let x = MathHelper.snap(cellLocalPosition.x, CELL_SIZE.x);
    let y = MathHelper.snap(cellLocalPosition.y, CELL_SIZE.y);
    let z = MathHelper.snap(cellLocalPosition.z, CELL_SIZE.z);

    x = Math.max(0, Math.min(this.size - 1, Math.floor((x + this.width / 2) / CELL_SIZE.x)));
    y = Math.max(0, Math.min(this.size - 1, Math.floor(y > 0 ? y / CELL_SIZE.y : 0)));
    z = Math.max(0, Math.min(this.size - 1, Math.floor((z + this.depth / 2) / CELL_SIZE.z)));

    const cell = this.getCellByIndex(x, y, z);

    if (!cell) {
      throw new Error(`Cell not found at position ${worldPosition}, on indices ${x}, ${y}, ${z}.`);
    }

    return cell;
  }

  getCellByIndex(x: number, y: number, z: number): Cell {
    if (y < this.cells.length) {
      if (z < this.cells[y].length) {
        if (x < this.cells[y][z].length) {
          return this.cells[y][z][x];
        }
      }
    }

    return null;
  }

  resize(size: number) {
    if (this.size === size) {
      return;
    }

    this.size = size;

    const gridHelper = new THREE.GridHelper(this.size * CELL_SIZE.x, this.size);

    const selectorGeometry = new THREE.PlaneGeometry(this.width, this.depth);
    selectorGeometry.rotateX(THREE.Math.degToRad(90));

    this._selectorMesh = new THREE.Mesh(selectorGeometry, this._selectorMaterial);
    gridHelper.add(this._selectorMesh);

    const gridHelperParent = this._gridHelper.parent;

    gridHelperParent.remove(this._gridHelper);

    this._gridHelper = gridHelper;

    gridHelperParent.add(this._gridHelper);

    this.initCells();

    this.gridResize.emit(this.size);
  }
}
