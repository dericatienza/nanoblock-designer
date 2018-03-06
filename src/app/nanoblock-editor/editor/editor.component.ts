import { Component, OnInit, ViewChild } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { BrickType, Brick, BrickColor } from './editor.models';
import { Response } from '@angular/http';

import { BrickTypeService } from '../brick-type.service';
import * as THREE from 'three';
import { Geometry, Material, MeshPhongMaterial, Vector3, Vector2 } from 'three';
import { BrickColorService, CLEAR_COLOR_OPACITY } from '../brick-color.service';
import { GridDirective, CELL_SIZE, Cell } from '../objects/grid.directive';
import { EditorMode } from './editor-mode';
import { SelectEditorMode } from './modes/select-editor-mode';
import { BuildEditorMode } from './modes/build-editor-mode';
import { Command } from './command';
import { RendererComponent } from '../../three-js/renderer/renderer.component';
import { MathHelper } from '../../helpers/math-helper';
import { BrickObject } from './brick-object';

const CURRENT_BRICK_OPACITY_FACTOR = 0.5;
const VECTOR3_ZERO = new Vector3(0, 0, 0);

export enum RotateDirection {
  Right,
  Left
}

@Component({
  selector: 'ne-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild('scene')
  private _scene: SceneDirective;

  @ViewChild('grid')
  private _grid: GridDirective;

  get grid(): GridDirective {
    return this._grid;
  }

  @ViewChild('gridSelector')
  private _gridSelector: GridSelectorDirective;
  get gridSelector(): GridSelectorDirective {
    return this._gridSelector;
  }

  @ViewChild('renderer')
  private _renderer: RendererComponent;

  get renderer(): RendererComponent {
    return this._renderer;
  }

  brickTypes: BrickType[];
  brickColors: BrickColor[];
  private _brickTypeGeometries: Map<number, Geometry>;

  private _currentBrickType: BrickType;
  get currentBrickType(): BrickType {
    return this._currentBrickType;
  }
  set currentBrickType(v: BrickType) {
    this._currentBrickType = v;
  }

  private _currentBrickColor: BrickColor;
  get currentBrickColor(): BrickColor {
    return this._currentBrickColor;
  }
  set currentBrickColor(v: BrickColor) {
    this._currentBrickColor = v;
  }

  private _currentBrickObject: BrickObject;
  get currentBrickObject(): BrickObject {
    return this._currentBrickObject;
  }

  private _brickIdCounter = 0;

  private _modes: Map<string, EditorMode>;

  private _currentMode: EditorMode;
  private set currentMode(v: EditorMode) {
    // if (this._currentMode === v) {
    //   return;
    // }

    if (this._currentMode) {
      this._currentMode.exit();
    }

    v.enter();

    this._currentMode = v;
  }

  brickObjects: BrickObject[];

  constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) {
  }

  initBrickTypes(): void {
    this._brickTypeService.getBrickTypes()
      .subscribe((brickTypes: BrickType[]) => {
        this.brickTypes = brickTypes;
        this.initBrickTypeGeometries();

        this.initBrickColors();
      });
  }

  initBrickTypeGeometries() {
    this._brickTypeGeometries = new Map<number, Geometry>();

    for (const brickType of this.brickTypes) {
      this._brickTypeGeometries.set(brickType.id, this._brickTypeService.getBrickTypeGeometry(brickType));
    }
  }

  initBrickColors() {
    this._brickColorService.getDefaultBrickColors()
      .subscribe((brickColors: BrickColor[]) => {
        this.brickColors = brickColors;

        this._currentBrickColor = this.brickColors[0];
      });
  }

  ngOnInit() {
    this.initBrickTypes();
    this._modes = new Map<string, EditorMode>();
    this.brickObjects = [];
  }

  setMode(modeClassRef: { new(editor: EditorComponent) }) {
    if (!this._modes.has(modeClassRef.name)) {
      const newModeInstance = new modeClassRef(this);

      this._modes.set(modeClassRef.name, newModeInstance);
    }

    this.currentMode = this._modes.get(modeClassRef.name);
  }

  createCurrentBrickObject() {
    const brickObject = this.createBrickObject(this._currentBrickType, this._currentBrickColor);

    this._scene.object.add(brickObject.object);

    this._currentBrickObject = brickObject;
  }

  destroyCurrentBrickObject() {
    if (!this._currentBrickObject) {
      return;
    }

    this._scene.object.remove(this.currentBrickObject.object);
    this._currentBrickObject = null;
  }

  setCurrentBrickOpacity() {
    const currentBrickMaterial = <Material>this._currentBrickObject.mesh.material;

    currentBrickMaterial.transparent = true;
    currentBrickMaterial.opacity *= CURRENT_BRICK_OPACITY_FACTOR;

    currentBrickMaterial.needsUpdate = true;
  }

  resetCurrentBrickOpacity() {
    const currentBrickMaterial = <Material>this._currentBrickObject.mesh.material;

    currentBrickMaterial.transparent = this.currentBrickColor.isClear;
    currentBrickMaterial.opacity = this.currentBrickColor.isClear ? CLEAR_COLOR_OPACITY : 1;

    currentBrickMaterial.needsUpdate = true;
  }

  testBrickTypes() {
    const color = this.brickColors[0];

    let startX = this._grid.width / -2;

    for (let x = 0; x < this.brickTypes.length; x++) {
      const brickType = this.brickTypes[x];

      const brickObject = this.createBrickObject(brickType, color);

      this._scene.object.add(brickObject.object);

      brickObject.object.position.set(startX, 0, 0);

      startX += (CELL_SIZE.x * brickType.width) + CELL_SIZE.x;
    }
  }

  createBrickObject(type: BrickType, color: BrickColor): BrickObject {
    const geometry = this._brickTypeGeometries.get(type.id);

    const material = this._brickColorService.getBrickColorMaterial(color);

    const object = new THREE.Object3D();
    const mesh = new THREE.Mesh(geometry, material);

    object.add(mesh);

    const brick = new Brick();
    brick.x = brick.y = brick.z = -1;
    brick.xRotation = brick.yRotation = brick.zRotation = 0;
    brick.id = this._brickIdCounter++;
    brick.typeId = type.id;
    brick.colorId = color.id;

    const brickObject = new BrickObject();
    brickObject.object = object;
    brickObject.brick = brick;
    brickObject.brickType = type;

    return brickObject;
  }

  onRendererClick() {
    this.renderer.canvas.focus();
  }

  rotateBrickObject(brickObject: BrickObject, direction: RotateDirection) {
    let degrees: number;

    switch (direction) {
      case RotateDirection.Right:
        degrees = 90;
        break;
      case RotateDirection.Left:
        degrees = -90;
        break;
      default:
        degrees = 90;
        break;
    }

    brickObject.brick.yRotation += degrees;

    if (brickObject.brick.yRotation >= 360 ||
      brickObject.brick.yRotation <= -360) {
      brickObject.brick.yRotation = 0;
    }

    const radians = THREE.Math.degToRad(brickObject.brick.yRotation);

    brickObject.object.setRotationFromAxisAngle(new Vector3(0, 1, 0), radians);
  }

  ngAfterViewInit(): void {
    this.setMode(SelectEditorMode);
  }

  onBrickTypeChanged(id: number) {
    this._currentBrickType = this.brickTypes.find(x => x.id === id);

    this.setMode(BuildEditorMode);
  }

  onCellHighlighted(cell: Cell) {
    this._currentMode.highlight(cell);
  }

  onCellSelected(cell: Cell) {
    this._currentMode.select(cell);
  }

  executeCommand(command: Command) {
    // TODO: Implement command history for undoing and redoing actions
    command.do(this);
  }

  buildBrickObject(brickObject: BrickObject, cell: Cell) {
    if (this.brickObjects.indexOf(brickObject) > -1) {
      throw new RangeError(`Brick object is already in editor's built brick objects.`);
    }

    this._gridSelector.addSelectable(brickObject.mesh);

    brickObject.object.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);

    brickObject.brick.x = cell.x;
    brickObject.brick.y = cell.y;
    brickObject.brick.z = cell.z;

    brickObject.cell = cell;
    this.brickObjects.push(brickObject);
  }

  destroyBrickObject(brickObject: BrickObject) {
    const brickObjectIndex = this.brickObjects.indexOf(brickObject);

    if (brickObjectIndex < 0) {
      throw new RangeError(`Brick object is not in editor's built brick objects.`);
    }

    this._gridSelector.removeSelectable(brickObject.mesh);

    brickObject.cell = null;
    this.brickObjects.splice(brickObjectIndex, 1);
  }

  getValidCell(brickObject: BrickObject, cell: Cell): Cell {
    let validCell: Cell;

    while (!validCell) {
      if (this.checkCellBuildable(brickObject, cell)) {
        validCell = cell;
      } else {
        cell = this._grid.getCellByIndex(cell.x, cell.y + 1, cell.z);

        if (!cell) {
          return null;
        }
      }
    }

    return validCell;
  }

  checkCellBuildable(brickObject: BrickObject, cell: Cell): boolean {
    const brickObjectCells = this.getOccupiedCells(brickObject, cell);

    for (const builtBrickObject of this.brickObjects) {
      const builtBrickObjectCells = this.getOccupiedCells(builtBrickObject, builtBrickObject.cell);

      const isIntersecting = brickObjectCells.some(x => builtBrickObjectCells.indexOf(x) > -1);

      if (isIntersecting) {
        return false;
      }
    }

    if (cell.y > 0) {
      const belowBrickObjectsCells = this.getBrickObjectsOccupiedCells(this.getBrickObjectsByIndex(-1, cell.y - 1, -1));

      let hasFooting = brickObjectCells.some(x =>
        belowBrickObjectsCells.some(y => y.x === x.x && y.z === x.z));

      if (!hasFooting) {
        const aboveBrickObjectsCells = this.getBrickObjectsOccupiedCells(this.getBrickObjectsByIndex(-1, cell.y + 1, -1));

        hasFooting = brickObjectCells.some(x =>
          aboveBrickObjectsCells.some(y => y.x === x.x && y.z === x.z));

        if (!hasFooting) {
          return false;
        }
      }
    }

    return true;
  }

  getBrickObjectsOccupiedCells(brickObjects: BrickObject[]): Cell[] {
    const cells = [];

    brickObjects.map(x => cells.push(...this.getOccupiedCells(x, x.cell)));

    return cells;
  }

  getBrickObjectsByIndex(x: number = -1, y: number = -1, z: number = -1) {
    const brickObjects = this.brickObjects.filter(b =>
      x > -1 ? b.brick.x === x : true &&
        y > -1 ? b.brick.y === y : true &&
          z > -1 ? b.brick.z === z : true
    );

    return brickObjects;
  }

  getOccupiedCells(brickObject: BrickObject, cell: Cell): Cell[] {
    const brickType = brickObject.brickType;

    const cells = [];

    for (let y = 0; y < brickType.height; y++) {
      for (let z = 0; z < brickType.depth; z++) {
        for (let x = 0; x < brickType.width; x++) {
          if (!brickType.arrangement[(z * brickType.width) + x]) {
            continue;
          }

          const position = new THREE.Vector3(x, y, z);
          const offset = this.getCellOffset(brickObject.brick.yRotation, position);

          const occupiedCell = this._grid.getCellByIndex(
            cell.x + offset.x,
            cell.y + offset.y,
            cell.z + offset.z
          );

          if (occupiedCell) {
            cells.push(occupiedCell);
          }
        }
      }
    }

    return cells;
  }

  getCellOffset(rotation: number, position: THREE.Vector3): THREE.Vector3 {
    const offset = new THREE.Vector3();

    switch (rotation) {
      case -270:
        offset.x = position.z;
        offset.y = position.y;
        offset.z = -position.x;
        break;
      case -180:
        offset.x = -position.x;
        offset.y = position.y;
        offset.z = -position.z;
        break;
      case -90:
        offset.x = -position.z;
        offset.y = position.y;
        offset.z = position.x;
        break;
      case 0:
        offset.x = position.x;
        offset.y = position.y;
        offset.z = position.z;
        break;
      case 90:
        offset.x = position.z;
        offset.y = position.y;
        offset.z = -position.x;
        break;
      case 180:
        offset.x = -position.x;
        offset.y = position.y;
        offset.z = -position.z;
        break;
      case 270:
        offset.x = -position.z;
        offset.y = position.y;
        offset.z = position.x;
        break;
      default:
        break;
    }

    return offset;
  }
}
