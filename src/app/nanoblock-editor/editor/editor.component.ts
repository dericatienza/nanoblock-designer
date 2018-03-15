import { Component, OnInit, ViewChild } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { BrickType, Brick, BrickColor, Design } from './editor.models';
import { Response } from '@angular/http';

import { BrickTypeService } from '../brick-type.service';
import * as THREE from 'three';
import {
  Geometry, Material, MeshPhongMaterial, Vector3, Vector2, Color, LineBasicMaterial,
  EdgesGeometry, BufferGeometry, WireframeGeometry, MeshBasicMaterial
} from 'three';
import { BrickColorService, CLEAR_COLOR_OPACITY } from '../brick-color.service';
import { GridDirective, CELL_SIZE, Cell } from '../objects/grid.directive';
import { EditorMode } from './editor-mode';
import { SelectEditorMode } from './modes/select-editor-mode';
import { BuildEditorMode } from './modes/build-editor-mode';
import { Command } from './command';
import { RendererComponent } from '../../three-js/renderer/renderer.component';
import { MathHelper } from '../../helpers/math-helper';
import { BrickObject } from './brick-object';
import { BrickTypesListComponent } from '../brick-types-list/brick-types-list.component';
import { BrickColorsListComponent } from '../brick-colors-list/brick-colors-list.component';
import { ReadFile } from 'ngx-file-helpers';
import { JsonConvert } from 'json2typescript';

const CURRENT_BRICK_OPACITY_FACTOR = 0.5;

const VECTOR3_ZERO = new Vector3(0, 0, 0);

const KEY_UNDO = 90;
const KEY_REDO = 89;

const COMMAND_MAX_HISTORY_LENGTH = 20;

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

  @ViewChild('brickTypesList')
  private _brickTypesList: BrickTypesListComponent;

  @ViewChild('brickColorsList')
  private _brickColorsList: BrickColorsListComponent;

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

  private _defaultBrickColors: BrickColor[];

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

    if (this._brickTypesList) {
      this._brickTypesList.brickColor = this._currentBrickColor;
    }

    if (this.currentBrickObject) {
      this.currentBrickObject.brick.colorId = this.currentBrickColor.id;

      this.refreshCurrentBrickColor();
      this.setCurrentBrickOpacity();
    }
  }

  private _currentBrickObject: BrickObject;
  get currentBrickObject(): BrickObject {
    return this._currentBrickObject;
  }

  private _brickIdCounter = 0;

  private _modes: Map<string, EditorMode>;

  private _currentMode: EditorMode;
  private set currentMode(v: EditorMode) {
    if (this._currentMode) {
      this._currentMode.exit();
    }

    v.enter();

    this._currentMode = v;
  }

  brickObjects: BrickObject[];

  private _currentBrickSelectedMaterial: MeshPhongMaterial;

  private _brickWireframeMaterial = new LineBasicMaterial(
    {
      color: 'black',
      linewidth: 2,
      transparent: true,
      opacity: 0.5
    }
  );

  private _brickHighlightMaterial = new MeshBasicMaterial(
    {
      color: 'black',
      side: THREE.BackSide
    });

  private _commandHistory: Command[];
  private _commandHistoryIndex = -1;

  constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) {
    this.onKeyDown = this.onKeyDown.bind(this);

    this._currentBrickSelectedMaterial = new MeshPhongMaterial({
      color: 'white',
      transparent: true,
      opacity: CURRENT_BRICK_OPACITY_FACTOR
    });
  }

  initBrickTypes(): void {
    this._brickTypeService.getBrickTypes()
      .subscribe((brickTypes: BrickType[]) => {
        this.brickTypes = brickTypes;
        this.initBrickTypeGeometries();

        this.currentBrickColor = this.brickColors[0];
      });
  }

  initBrickTypeGeometries() {
    for (const brickType of this.brickTypes) {
      this._brickTypeService.getBrickTypeGeometry(brickType);
    }
  }

  initBrickColors() {
    this._brickColorService.getDefaultBrickColors()
      .subscribe((brickColors: BrickColor[]) => {
        this._defaultBrickColors = brickColors;

        this.brickColors = [];
        this.brickColors.push(...this._defaultBrickColors.map(x => BrickColor.clone(x)));

        this.initBrickColorMaterials();

        this.initBrickTypes();
      });
  }

  initBrickColorMaterials() {
    for (const brickColor of this.brickColors) {
      this._brickColorService.getBrickColorMaterial(brickColor);
    }
  }

  ngOnInit() {
    this.initBrickColors();
    this._modes = new Map<string, EditorMode>();
    this.brickObjects = [];
    this._commandHistory = [];
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
    this._currentBrickSelectedMaterial.color.set(this.currentBrickColor.colorHex);
    this._currentBrickSelectedMaterial.opacity = (this.currentBrickColor.isClear ? 1 : 0.5) * CURRENT_BRICK_OPACITY_FACTOR;

    this._currentBrickObject.mesh.material = this._currentBrickSelectedMaterial;

    this._currentBrickSelectedMaterial.needsUpdate = true;
  }

  refreshCurrentBrickColor() {
    this.currentBrickObject.mesh.material = this._brickColorService.getBrickColorMaterial(this.currentBrickColor);
  }

  createBrickObject(type: BrickType, color: BrickColor): BrickObject {
    const geometry = this._brickTypeService.getBrickTypeGeometry(type);

    const material = this._brickColorService.getBrickColorMaterial(color);

    const object = new THREE.Object3D();
    const mesh = new THREE.Mesh(geometry, material);

    // const wireframeGeometry = new WireframeGeometry(geometry);
    // const wireframeGeometry = new EdgesGeometry(geometry, 1);
    // const wireframe = new THREE.LineSegments(wireframeGeometry, this._brickWireframeMaterial);
    // mesh.add(wireframe);

    object.add(mesh);

    const brick = new Brick();
    brick.x = brick.y = brick.z = -1;
    brick.pivotX = brick.pivotY = brick.pivotZ = 0;
    brick.rotationX = brick.rotationY = brick.rotationZ = 0;
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

    brickObject.rotationY += degrees;
  }

  ngAfterViewInit(): void {
    this.addListeners();

    this.setMode(SelectEditorMode);
  }

  addListeners() {
    this.renderer.canvas.addEventListener('keydown', this.onKeyDown);
  }

  removeListeners() {
    this.renderer.canvas.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      if (event.keyCode === KEY_UNDO) {
        this.undo();
      } else if (event.keyCode === KEY_REDO) {
        this.redo();
      }
    }
  }

  undo() {
    if (this._commandHistoryIndex > -1) {
      this._commandHistory[this._commandHistoryIndex--].undo(this);
    }
  }

  redo() {
    if (this._commandHistoryIndex < this._commandHistory.length - 1) {
      this._commandHistory[++this._commandHistoryIndex].do(this);
    }
  }

  onBrickTypeChanged(brickType: BrickType) {
    this.currentBrickType = brickType;

    this.setMode(BuildEditorMode);
  }

  onBrickColorSelectionChanged(brickColor: BrickColor) {
    this.currentBrickColor = brickColor;
  }

  onBrickColorChanged(brickColor: BrickColor) {
    if (this.currentBrickObject && this.currentBrickColor === brickColor) {
      this.setCurrentBrickOpacity();
    }
  }

  onCellHighlighted(cell: Cell) {
    this._currentMode.highlight(cell);
  }

  onCellSelected(cell: Cell) {
    this._currentMode.select(cell);
  }

  executeCommand(command: Command) {
    command.do(this);

    if (this._commandHistoryIndex < this._commandHistory.length - 1) {
      this._commandHistory.splice(this._commandHistoryIndex + 1, this._commandHistory.length - this._commandHistoryIndex - 1);
    }

    this._commandHistory.push(command);

    if (this._commandHistory.length > COMMAND_MAX_HISTORY_LENGTH) {
      this._commandHistory.shift();
    }

    this._commandHistoryIndex = this._commandHistory.length - 1;
  }

  buildBrickObject(brickObject: BrickObject, cell: Cell) {
    if (this.brickObjects.indexOf(brickObject) > -1) {
      throw new RangeError(`Brick object is already in editor's built brick objects.`);
    }

    if (cell.y < 0) {
      // Shift all bricks up and insert brick at bottom
      this.shiftLevel(0, 1);

      cell = this.grid.getCellByIndex(cell.x, 0, cell.z);
    }

    this._gridSelector.addSelectable(brickObject.mesh);

    brickObject.object.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);

    brickObject.brick.x = cell.x;
    brickObject.brick.y = cell.y;
    brickObject.brick.z = cell.z;

    brickObject.cell = cell;

    this._scene.object.add(brickObject.object);

    this.brickObjects.push(brickObject);
  }

  destroyBrickObject(brickObject: BrickObject) {
    const brickObjectIndex = this.brickObjects.indexOf(brickObject);

    if (brickObjectIndex < 0) {
      throw new RangeError(`Brick object is not in editor's built brick objects.`);
    }

    const deletedBrickObjectY = brickObject.cell.y;

    this._gridSelector.removeSelectable(brickObject.mesh);

    brickObject.cell = null;

    this._scene.object.remove(brickObject.object);

    this.brickObjects.splice(brickObjectIndex, 1);

    const levelBrickObjects = this.getBrickObjectsByIndex(-1, deletedBrickObjectY, -1);

    if (levelBrickObjects.length < 1) {
      this.shiftLevel(deletedBrickObjectY, -1);
    }
  }

  onBrickColorDeleted(brickColor: BrickColor) {
    const deleteBrickColorIndex = this.brickColors.indexOf(brickColor);

    const fallbackBrickColor = this._brickColorsList.selectedBrickColor;

    const brickObjects = this.brickObjects.filter(x => x.brick.colorId === brickColor.id);

    brickObjects.forEach(x => this.setBrickObjectColor(x, fallbackBrickColor));

    this.brickColors.splice(deleteBrickColorIndex, 1);

    this._brickColorService.deleteBrickColorMaterial(brickColor);
  }

  setBrickObjectColor(brickObject: BrickObject, brickColor: BrickColor) {
    brickObject.mesh.material = this._brickColorService.getBrickColorMaterial(brickColor);

    brickObject.brick.colorId = brickColor.id;
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

    const pivot = brickObject.pivot;

    const cells = [];

    for (let y = 0; y < brickType.height; y++) {
      for (let z = 0; z < brickType.depth; z++) {
        for (let x = 0; x < brickType.width; x++) {
          if (!brickType.arrangement[(z * brickType.width) + x]) {
            continue;
          }
          const position = new THREE.Vector3(x, y, z);
          position.x -= pivot.x;
          position.z -= pivot.z;

          const offset = this.getCellOffset(brickObject.brick.rotationY, position);

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

  getCellOffset(yRotation: number, position: THREE.Vector3): THREE.Vector3 {
    const offset = new THREE.Vector3();

    switch (yRotation) {
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

  shiftLevel(y: number, amount: number) {
    if (amount === 0) {
      return;
    }

    const brickObjects = this.brickObjects.filter(x => x.cell.y >= y);

    for (const brickObject of brickObjects) {
      const cell = this.grid.getCellByIndex(brickObject.cell.x, brickObject.cell.y + amount, brickObject.cell.z);

      if (cell) {
        this.moveBrickObject(brickObject, cell);
      }
    }
  }

  moveBrickObject(brickObject: BrickObject, cell: Cell) {
    brickObject.object.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);

    brickObject.brick.x = cell.x;
    brickObject.brick.y = cell.y;
    brickObject.brick.z = cell.z;

    brickObject.cell = cell;
  }

  onResetButtonClicked() {
    this.resetEditor();
  }

  loadDesign(design: Design) {
    this.clearBrickObjects();

    this.brickObjects = [];

    this._brickColorService.clearBrickColorMaterials();

    this.brickColors = design.colors;

    for (const brick of design.bricks) {
      const brickType = this.brickTypes.find(x => x.id === brick.typeId);
      const brickColor = this.brickColors.find(x => x.id === brick.colorId);

      const brickObject = this.createBrickObject(brickType, brickColor);

      brickObject.pivotZ = brick.pivotZ;
      brickObject.pivotX = brick.pivotX;

      brickObject.rotationY = brick.rotationY;

      const cell = this.grid.getCellByIndex(brick.x, brick.y, brick.z);

      this.buildBrickObject(brickObject, cell);
    }
  }

  resetEditor() {
    this.clearBrickObjects();

    this.brickObjects = [];

    this.resetBrickColors();
  }

  clearBrickObjects() {
    this._gridSelector.clearSelectableObjects();

    for (const brickObject of this.brickObjects) {
      this._scene.object.remove(brickObject.object);
    }
  }

  resetBrickColors() {
    this._brickColorService.clearBrickColorMaterials();

    this.brickColors = [];
    this.brickColors.push(...this._defaultBrickColors.map(x => BrickColor.clone(x)));
  }

  onSaveButtonClicked() {
    const design = new Design();

    design.bricks = this.brickObjects.map(x => x.brick);
    design.colors = this.brickColors;

    this.promptDownloadJSON(design, 'nanoblock-design');
  }

  onLoadFilePicked(file: ReadFile) {
    const jsonString = atob(file.content.replace('data:;base64,', ''));
    const json: object = JSON.parse(jsonString);

    const jsonConvert: JsonConvert = new JsonConvert();
    const design: Design = jsonConvert.deserializeObject(json, Design);

    if (design) {
      this.loadDesign(design);
    }
  }

  promptDownloadJSON(object: any, title: string) {
    const json = JSON.stringify(object);

    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(json);
    const downloader = document.createElement('a');

    downloader.setAttribute('href', data);
    downloader.setAttribute('download', `${title}.json`);
    downloader.click();
  }
}
