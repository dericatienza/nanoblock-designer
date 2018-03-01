import { Component, OnInit, ViewChild } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { BrickType, Brick, BrickColor } from './editor.models';
import { Response } from '@angular/http';

import { BrickTypeService } from '../brick-type.service';
import * as THREE from 'three';
import { Geometry, Material, MeshPhongMaterial } from 'three';
import { BrickColorService, CLEAR_COLOR_OPACITY } from '../brick-color.service';
import { GridDirective, CELL_SIZE, Cell } from '../objects/grid.directive';
import { EditorMode } from './editor-mode';
import { SelectEditorMode } from './modes/select-editor-mode';
import { BuildEditorMode } from './modes/build-editor-mode';
import { Command } from './command';

const CURRENT_BRICK_OPACITY_FACTOR = 0.5;

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

  @ViewChild('gridSelector')
  private _gridSelector: GridSelectorDirective;

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

    this._scene.object.add(brickObject.mesh);

    this._currentBrickObject = brickObject;
  }

  destroyCurrentBrickObject() {
    if (!this._currentBrickObject) {
      return;
    }

    this._scene.object.remove(this.currentBrickObject.mesh);
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

      this._scene.object.add(brickObject.mesh);

      brickObject.mesh.position.set(startX, 0, 0);

      startX += (CELL_SIZE.x * brickType.width) + CELL_SIZE.x;
    }
  }

  createBrickObject(type: BrickType, color: BrickColor): BrickObject {
    const geometry = this._brickTypeGeometries.get(type.id);

    const material = this._brickColorService.getBrickColorMaterial(color);

    const mesh = new THREE.Mesh(geometry, material);

    const brick = new Brick();
    brick.x = brick.y = brick.z = -1;
    brick.id = this._brickIdCounter++;
    brick.typeId = type.id;
    brick.colorId = color.id;

    const brickObject = new BrickObject();
    brickObject.mesh = mesh;
    brickObject.brick = brick;

    return brickObject;
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

    brickObject.mesh.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);

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

    return true;
  }

  getOccupiedCells(brickObject: BrickObject, cell: Cell): Cell[] {
    const brickType = this.brickTypes.find(x => x.id === brickObject.brick.typeId);

    const cells = [];

    for (let y = 0; y < brickType.height; y++) {
      for (let z = 0; z < brickType.depth; z++) {
        for (let x = 0; x < brickType.width; x++) {
          if (!brickType.arrangement[(z * brickType.width) + x]) {
            continue;
          }

          const occupiedCell = this._grid.getCellByIndex(
            cell.x + x,
            cell.y + y,
            cell.z + z
          );

          if (cell) {
            cells.push(occupiedCell);
          }
        }
      }
    }

    return cells;
  }
}

export class BrickObject {
  mesh: THREE.Mesh;
  brick: Brick;
  cell: Cell;
}
