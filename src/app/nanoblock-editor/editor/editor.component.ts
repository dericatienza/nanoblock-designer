import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { BrickType, Brick, BrickColor, Design } from './editor.models';
import { Response } from '@angular/http';

import { BrickTypeService } from '../brick-type.service';
import * as three from 'three';
import {
  Geometry, Material, MeshPhongMaterial, Vector3, Vector2, Color, LineBasicMaterial,
  EdgesGeometry, BufferGeometry, WireframeGeometry, MeshBasicMaterial, Object3D
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
import { ReadFile, FilePickerDirective } from 'ngx-file-helpers';
import { JsonConvert } from 'json2typescript';
import { BrickObjectHighlightDirective } from '../objects/brick-object-highlight.directive';

import '../../../assets/js/OutlinesGeometry';
import { PaintEditorMode } from './modes/paint-editor-mode';
import { EraseEditorMode } from './modes/erase-editor-mode';
import { EditorModeComponent } from '../editor-mode/editor-mode.component';

declare var THREE: any;

const CURRENT_BRICK_OPACITY_FACTOR = 0.75;

const VECTOR3_ZERO = new Vector3(0, 0, 0);

const KEY_UNDO = 90;
const KEY_REDO = 89;

const COMMAND_MAX_HISTORY_LENGTH = 20;

const DEFAULT_GRID_SIZE = 24;

export enum RotateDirection {
  Right,
  Left
}

export const BRICK_OUTLINE_MATERIAL = new LineBasicMaterial(
  {
    color: 'black',
    linewidth: 2,
    transparent: true,
    opacity: 0.25
  }
);

export class ResizeModel {
  size: number;
}

@Component({
  selector: 'ne-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild('scene')
  private _scene: SceneDirective;

  get scene(): SceneDirective {
    return this._scene;
  }

  @ViewChild('modesList')
  private _modesList: EditorModeComponent;

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

  @ViewChild('brickObjectHighlight')
  private _brickObjectHighlight: BrickObjectHighlightDirective;

  get brickObjectHighlight(): BrickObjectHighlightDirective {
    return this._brickObjectHighlight;
  }

  @ViewChild('renderer')
  private _renderer: RendererComponent;

  get renderer(): RendererComponent {
    return this._renderer;
  }

  @ViewChild(FilePickerDirective)
  private _filePicker: FilePickerDirective;

  @ViewChild('resizeDismissButton')
  private _resizeDismissButton: ElementRef;

  @ViewChild('loadingDesignToggleButton')
  private _loadingDesignToggleButton: ElementRef;

  brickTypes: BrickType[];
  brickColors: BrickColor[];

  private _defaultBrickColors: BrickColor[];

  private _currentBrickType: BrickType;

  get currentBrickType(): BrickType {
    return this._currentBrickType;
  }

  set currentBrickType(v: BrickType) {
    this._currentBrickType = v;

    this.setMode('build');
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

    this.renderer.canvas.focus();
  }

  private _currentBrickObject: BrickObject;

  get currentBrickObject(): BrickObject {
    return this._currentBrickObject;
  }

  set currentBrickObject(v: BrickObject) {
    this._currentBrickObject = v;
  }

  private _brickIdCounter = 0;

  private _modes: EditorMode[] = [
    new SelectEditorMode(this),
    new BuildEditorMode(this),
    new PaintEditorMode(this),
    new EraseEditorMode(this)
  ];

  get modes(): EditorMode[] {
    return this._modes;
  }

  private _currentMode: EditorMode;

  get currentMode(): EditorMode {
    return this._currentMode;
  }

  set currentMode(v: EditorMode) {
    if (this._currentMode) {
      this._currentMode.exit();
    }

    v.enter();

    this._currentMode = v;
  }

  brickObjects: BrickObject[];

  private _brickObjectCells: Map<BrickObject, Cell[]>;

  private _currentBrickSelectedMaterial: MeshPhongMaterial;

  private _commandHistory: Command[];

  get commandHistory(): Command[] {
    return this._commandHistory;
  }

  private _commandHistoryIndex = -1;

  get commandHistoryIndex(): number {
    return this._commandHistoryIndex;
  }

  set commandHistoryIndex(v: number) {
    this._commandHistoryIndex = v;
  }

  hasUnsavedChanges = false;

  resizeModel: ResizeModel = {
    size: DEFAULT_GRID_SIZE
  };

  constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) {
    this.onKeyDown = this.onKeyDown.bind(this);

    this._currentBrickSelectedMaterial = new MeshPhongMaterial({
      color: 'white',
      transparent: true,
      opacity: CURRENT_BRICK_OPACITY_FACTOR
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  initBrickTypes(): void {
    this._brickTypeService.getBrickTypes()
      .subscribe((brickTypes: BrickType[]) => {
        this.brickTypes = brickTypes;

        this.brickTypes.sort((a, b) => a.width * a.depth - b.width * b.depth);

        this.initBrickTypeGeometries();

        this._currentBrickType = this.brickTypes[0];
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

        this.currentBrickColor = this.brickColors[0];

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

    this.brickObjects = [];
    this._brickObjectCells = new Map<BrickObject, Cell[]>();
    this._commandHistory = [];

    this.setMode('select');
  }

  ngAfterViewInit(): void {
    this.addListeners();
  }

  setMode(name: string) {
    const mode = this._modes.find(x => x.name === name);

    if (mode) {
      this.currentMode = mode;
    }
  }

  createCurrentBrickObject() {
    const brickObject = this.createBrickObject(this._currentBrickType, this._currentBrickColor);

    this._scene.object.add(brickObject);

    this._currentBrickObject = brickObject;
  }

  destroyCurrentBrickObject() {
    if (!this._currentBrickObject) {
      return;
    }

    this._scene.object.remove(this.currentBrickObject);
    this._currentBrickObject = null;
  }

  setCurrentBrickOpacity() {
    this._currentBrickSelectedMaterial.color.set(this.currentBrickColor.colorHex);
    this._currentBrickSelectedMaterial.opacity = (this.currentBrickColor.isClear ? 1 : 0.5) * CURRENT_BRICK_OPACITY_FACTOR;

    this._currentBrickObject.mesh.material = this._currentBrickSelectedMaterial;

    this._currentBrickSelectedMaterial.needsUpdate = true;
  }

  refreshCurrentBrickColor() {
    this.refreshBrickColor(this.currentBrickObject);
  }

  refreshBrickColor(brickObject: BrickObject) {
    brickObject.mesh.material = this._brickColorService.getBrickColorMaterial(this.currentBrickColor);
  }

  createBrickObject(type: BrickType, color: BrickColor): BrickObject {
    const geometry = this._brickTypeService.getBrickTypeGeometry(type);

    const material = this._brickColorService.getBrickColorMaterial(color);

    const brickObject = new BrickObject();
    const mesh = new three.Mesh(geometry, material);

    const outlinesGeometry = new THREE.OutlinesGeometry(geometry, 45);
    const outline = new three.LineSegments(outlinesGeometry, BRICK_OUTLINE_MATERIAL);
    mesh.add(outline);

    brickObject.add(mesh);

    const brick = new Brick();
    brick.x = brick.y = brick.z = -1;
    brick.pivotX = brick.pivotY = brick.pivotZ = 0;
    brick.rotationX = brick.rotationY = brick.rotationZ = 0;
    brick.id = this._brickIdCounter++;
    brick.typeId = type.id;
    brick.colorId = color.id;

    brickObject.brick = brick;
    brickObject.brickType = type;
    brickObject.brickColor = color;

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

    this.hasUnsavedChanges = true;

    if (this._commandHistoryIndex < this._commandHistory.length - 1) {
      this._commandHistory.splice(this._commandHistoryIndex + 1, this._commandHistory.length - this._commandHistoryIndex - 1);
    }

    this._commandHistory.push(command);

    if (this._commandHistory.length > COMMAND_MAX_HISTORY_LENGTH) {
      this._commandHistory.shift();
    }

    this._commandHistoryIndex = this._commandHistory.length - 1;
  }

  removeUnmovedBrickObject(brickCellsMap: Map<BrickObject, Cell>) {
    const currentBrickCellsMap = this.snapshotBrickCells();

    const unmovedBrickObjects = [];

    brickCellsMap.forEach((value: Cell, key: BrickObject) => {
      if (currentBrickCellsMap.has(key) && currentBrickCellsMap.get(key) === value) {
        unmovedBrickObjects.push(key);
      }
    });

    for (const unmovedBrickObject of unmovedBrickObjects) {
      brickCellsMap.delete(unmovedBrickObject);
    }
  }

  snapshotBrickCells(): Map<BrickObject, Cell> {
    const snapshot = new Map<BrickObject, Cell>();

    for (const brickObject of this.brickObjects) {
      snapshot.set(brickObject, brickObject.cell);
    }

    return snapshot;
  }

  fixBrickBuild() {
    const brickObjectGroups = this.getBrickObjectGroups();

    for (const brickObjectGroup of brickObjectGroups) {
      const fallDistance = this.getFallDistance(brickObjectGroup);

      if (fallDistance > 0) {
        this.shiftBrickObjects(brickObjectGroup, -fallDistance);
      }
    }
  }

  getBrickObjectGroups() {
    const brickObjectGroups = [];

    for (const brickObject of this.brickObjects) {
      if (!brickObjectGroups.some(x => x.includes(brickObject))) {
        brickObjectGroups.push(this.getBrickObjectGroup(brickObject));
      }
    }

    return brickObjectGroups;
  }

  getFallDistance(brickObjectGroup: BrickObject[]): number {
    let bottomLevel = this.getGroupBottomBrickObjectLevel(brickObjectGroup);

    if (bottomLevel < 1) {
      return bottomLevel;
    }

    const brickObjectGroupCells = this.getBrickObjectCells(brickObjectGroup);

    const intersectionTestCells = this.getBrickObjectCells(this.brickObjects);

    brickObjectGroupCells.forEach(x => {
      intersectionTestCells.splice(intersectionTestCells.indexOf(x), 1);
    });

    let fallDistance = 0;

    while (bottomLevel > 0) {
      for (let x = 0; x < brickObjectGroupCells.length; x++) {
        brickObjectGroupCells[x] = this.grid.getCellByIndex(
          brickObjectGroupCells[x].x, brickObjectGroupCells[x].y - 1, brickObjectGroupCells[x].z);
      }

      const hasIntersection = brickObjectGroupCells.some(y => intersectionTestCells.some(z => y === z));

      if (hasIntersection) {
        break;
      }

      fallDistance++;

      bottomLevel--;
    }

    return fallDistance;
  }

  getGroupBottomBrickObjectLevel(brickObjectGroup: BrickObject[]): number {
    const bottomY = Math.min(...brickObjectGroup.map(x => x.cell.y));

    return bottomY;
  }

  buildBrickObject(brickObject: BrickObject, cell: Cell) {
    if (this.brickObjects.indexOf(brickObject) > -1) {
      throw new RangeError(`Brick object is already in editor's built brick objects.`);
    }

    if (cell.y < 0) {
      this.setBrickObjectCell(brickObject, cell);

      const topBrickObjects = this.getBrickObjectTopBrickObjects(brickObject);

      this.deleteBrickObjectCell(brickObject);

      const topBrickObjectsGroup = [];

      for (const topBrickObject of topBrickObjects) {
        const topBrickObjectGroup = this.getBrickObjectGroup(topBrickObject);

        topBrickObjectGroup.forEach(x => {
          if (!topBrickObjectsGroup.includes(x)) {
            topBrickObjectsGroup.push(x);
          }
        });
      }

      this.shiftBrickObjects(topBrickObjectsGroup, 1);

      cell = this.grid.getCellByIndex(cell.x, 0, cell.z);
    }

    this._gridSelector.addSelectable(brickObject.mesh);

    brickObject.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);

    this.setBrickObjectCell(brickObject, cell);

    this._scene.object.add(brickObject);

    this.brickObjects.push(brickObject);

    this.currentBrickObject = null;
  }

  removeBrickObject(brickObject: BrickObject, fixBuild: boolean = true) {
    const brickObjectIndex = this.brickObjects.indexOf(brickObject);

    if (brickObjectIndex < 0) {
      throw new RangeError(`Brick object is not in editor's built brick objects.`);
    }

    const deletedBrickObjectY = brickObject.cell.y;

    this._gridSelector.removeSelectable(brickObject.mesh);

    this.brickObjects.splice(brickObjectIndex, 1);

    this.deleteBrickObjectCell(brickObject);

    if (fixBuild) {
      this.fixBrickBuild();
    }
  }

  destroyBrickObject(brickObject: BrickObject) {
    this.removeBrickObject(brickObject);

    this._scene.object.remove(brickObject);
  }

  selectBrickObject(brickObject: BrickObject) {
    this._currentBrickType = brickObject.brickType;
    this.currentBrickColor = brickObject.brickColor;

    this.currentBrickObject = brickObject;
  }

  paintBrickObject(brickObject: BrickObject, brickColor: BrickColor) {
    brickObject.mesh.material = this._brickColorService.getBrickColorMaterial(brickColor);

    brickObject.brickColor = brickColor;
    brickObject.brick.colorId = brickColor.id;
  }

  onBrickColorDeleted(brickColor: BrickColor) {
    const deleteBrickColorIndex = this.brickColors.indexOf(brickColor);

    const fallbackBrickColor = this._brickColorsList.currentBrickColor;

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

    if (!brickObjectCells) {
      return false;
    }

    for (const builtBrickObject of this.brickObjects) {
      const builtBrickObjectCells = this._brickObjectCells.get(builtBrickObject);

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

    for (const brickObject of brickObjects) {
      cells.push(...this._brickObjectCells.get(brickObject));
    }

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

  setBrickObjectCell(brickObject: BrickObject, cell: Cell) {
    const cells = this.getOccupiedCells(brickObject, cell);

    if (cells) {
      brickObject.brick.x = cell.x;
      brickObject.brick.y = cell.y;
      brickObject.brick.z = cell.z;

      brickObject.cell = cell;

      this._brickObjectCells.set(brickObject, cells);
    }
  }

  deleteBrickObjectCell(brickObject: BrickObject) {
    this._brickObjectCells.delete(brickObject);

    brickObject.cell = null;
  }

  getOccupiedCells(brickObject: BrickObject, cell: Cell): Cell[] {
    const brickType = brickObject.brickType;

    const pivot = brickObject.brickPivot;

    const cells = [];

    for (let y = 0; y < brickType.height; y++) {
      for (let z = 0; z < brickType.depth; z++) {
        for (let x = 0; x < brickType.width; x++) {
          if (!brickType.arrangement[(z * brickType.width) + x]) {
            continue;
          }
          const position = new three.Vector3(x, y, z);
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
          } else {
            return null;
          }
        }
      }
    }

    return cells;
  }

  getBrickObjectFromCell(cell: Cell): BrickObject {
    const brickObjects = this.getBrickObjectsByIndex(-1, cell.y, -1);

    for (const brickObject of brickObjects) {
      if (brickObject.cell === cell) {
        return brickObject;
      }

      const cells = this._brickObjectCells.get(brickObject);

      if (cells.indexOf(cell) > -1) {
        return brickObject;
      }
    }

    return null;
  }

  getCellOffset(yRotation: number, position: three.Vector3): three.Vector3 {
    const offset = new three.Vector3();

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

  getBrickObjectGroup(brickObject: BrickObject): BrickObject[] {
    const brickObjectCells = this.getBrickObjectCells(this.brickObjects);

    const brickObjectGroup = [brickObject];

    this.getBrickObjectAdjacents(brickObject, brickObjectGroup, brickObjectCells);

    return brickObjectGroup;
  }

  getBrickObjectAdjacents(brickObject: BrickObject, brickObjects: BrickObject[], cells: Cell[],
    recursive: boolean = true) {
    const brickObjectCells = this._brickObjectCells.get(brickObject);

    const checkCells = cells.slice();

    brickObjectCells.forEach((x) => {
      const i = checkCells.indexOf(x);

      if (i > -1) {
        checkCells.splice(i, 1);
      }
    });

    for (const brickObjectCell of brickObjectCells) {
      for (const checkCell of checkCells) {

        const yDistance = Math.abs(checkCell.y - brickObjectCell.y);

        const isAdjacent = yDistance === 1 && checkCell.x === brickObjectCell.x && checkCell.z === brickObjectCell.z;

        if (isAdjacent) {
          const adjacentBrickObject = this.getBrickObjectFromCell(checkCell);

          if (brickObjects.indexOf(adjacentBrickObject) < 0) {
            brickObjects.push(adjacentBrickObject);

            if (recursive) {
              this.getBrickObjectAdjacents(adjacentBrickObject, brickObjects, cells);
            }
          }
        }
      }
    }
  }

  getBrickObjectTopBrickObjects(brickObject: BrickObject): BrickObject[] {
    const brickObjectsCells = this.getBrickObjectCellsByLevelRange(brickObject.cell.y + 1, brickObject.cell.y + 1);

    const brickObjects = [];

    this.getBrickObjectAdjacents(brickObject, brickObjects, brickObjectsCells);

    return brickObjects;
  }

  getBrickObjectBottomBrickObjects(brickObject: BrickObject): BrickObject[] {
    const brickObjectsCells = this.getBrickObjectCellsByLevelRange(brickObject.cell.y - 1, brickObject.cell.y - 1);

    const brickObjects = [];

    this.getBrickObjectAdjacents(brickObject, brickObjects, brickObjectsCells);

    return brickObjects;
  }

  getBrickObjectCellsByLevelRange(min: number, max: number): Cell[] {
    return this.getBrickObjectCells(this.brickObjects.filter(x => x.cell.y >= min && x.cell.y <= max));
  }

  getBrickObjectCells(brickObjects: BrickObject[]): Cell[] {
    const brickObjectCells = [];

    for (const brickObject of brickObjects) {
      brickObjectCells.push(...this._brickObjectCells.get(brickObject));
    }

    return brickObjectCells;
  }

  shiftLevel(y: number, amount: number) {
    if (amount === 0) {
      return;
    }

    const brickObjects = this.brickObjects.filter(x => x.cell.y >= y);

    this.shiftBrickObjects(brickObjects, amount);
  }

  shiftBrickObjects(brickObjects: BrickObject[], amount: number) {
    for (const brickObject of brickObjects) {
      const cell = this.grid.getCellByIndex(brickObject.cell.x, brickObject.cell.y + amount, brickObject.cell.z);

      if (cell) {
        this.moveBrickObject(brickObject, cell);
      }
    }
  }

  moveBrickObject(brickObject: BrickObject, cell: Cell) {
    brickObject.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);

    this.setBrickObjectCell(brickObject, cell);
  }

  onResetButtonClicked() {
    this.resetEditor();
  }

  loadBuildBrick(bricks: Brick[], take: number = 4) {
    for (let x = 0; x < take && bricks.length > 0; x++) {
      const brick = bricks.shift();

      const brickType = this.brickTypes.find(bt => bt.id === brick.typeId);
      const brickColor = this.brickColors.find(bc => bc.id === brick.colorId);

      const brickObject = this.createBrickObject(brickType, brickColor);

      brickObject.brickPivotZ = brick.pivotZ;
      brickObject.brickPivotX = brick.pivotX;

      brickObject.rotationY = brick.rotationY;

      const cell = this.grid.getCellByIndex(brick.x, brick.y, brick.z);

      this.buildBrickObject(brickObject, cell);
    }

    if (bricks.length > 0) {
      setTimeout(() => {
        this.loadBuildBrick(bricks, take);
      }, 0);
    } else {
      this._loadingDesignToggleButton.nativeElement.click();
    }
  }

  loadDesign(design: Design) {
    this._loadingDesignToggleButton.nativeElement.click();

    this.clearBrickObjects();

    this.brickObjects = [];

    this._brickColorService.clearBrickColorMaterials();

    this.brickColors = design.colors;
    this.currentBrickColor = this.brickColors[0];

    this.clearCommandHistory();

    this.setMode('select');

    let size = design.size;

    if (!size) {
      const minX = Math.min(...design.bricks
        .map(b => b.x));

      const maxX = Math.max(...design.bricks
        .map(b => b.x));

      const minY = Math.min(...design.bricks
        .map(b => b.y));

      const maxY = Math.max(...design.bricks
        .map(b => b.y));

      const minZ = Math.min(...design.bricks
        .map(b => b.z));

      const maxZ = Math.max(...design.bricks
        .map(b => b.z));

      const rotationBuffer = Math.max(...this.brickTypes.map(bt => Math.max(bt.width, bt.height, bt.depth)));

      const designSize = Math.max(maxX - minX, maxY - minY, maxZ - minZ) + 1 + rotationBuffer;

      size = designSize < DEFAULT_GRID_SIZE ? DEFAULT_GRID_SIZE : designSize;
    }

    this.setGridSize(size);

    const bricks = design.bricks.slice();

    this.loadBuildBrick(bricks);
  }

  getDesignSize(): number {
    const brickObjectCells = this.getBrickObjectCells(this.brickObjects);

    const minX = Math.min(...brickObjectCells
      .map(b => b.x));

    const maxX = Math.max(...brickObjectCells
      .map(b => b.x));

    const minY = Math.min(...brickObjectCells
      .map(b => b.y));

    const maxY = Math.max(...brickObjectCells
      .map(b => b.y));

    const minZ = Math.min(...brickObjectCells
      .map(b => b.z));

    const maxZ = Math.max(...brickObjectCells
      .map(b => b.z));

    const designSize = Math.max(maxX - minX, maxY - minY, maxZ - minZ) + 1;

    return designSize;
  }

  setGridSize(size: number) {
    if (this.grid.size === size) {
      return;
    }

    const designSize = this.getDesignSize();

    if (size < designSize) {
      throw new Error('Cannot resize to size smaller than built bricks bounds.');
    }

    const positionAdjustment = Math.floor((size - this.grid.size) / 2);

    const oldSelectorMesh = this.grid.selectorMesh;

    this.grid.resize(size);

    this.gridSelector.removeSelectable(oldSelectorMesh);
    this.gridSelector.addSelectable(this.grid.selectorMesh);

    for (const brickObject of this.brickObjects) {
      const newCell = this.grid.getCellByIndex(
        brickObject.cell.x + positionAdjustment,
        brickObject.cell.y,
        brickObject.cell.z + positionAdjustment,
      );

      this.moveBrickObject(brickObject, newCell);
    }

    this.resizeModel.size = size;

    this._resizeDismissButton.nativeElement.click();
  }

  onResize() {
    this.setGridSize(this.resizeModel.size);
  }

  resetEditor() {
    this.brickObjectHighlight.removeHighlight();

    this.clearBrickObjects();

    this.brickObjects = [];

    this.resetBrickColors();

    this.clearCommandHistory();

    this.setMode('select');
  }

  clearCommandHistory() {
    this._commandHistory = [];
    this._commandHistoryIndex = -1;
  }

  clearBrickObjects() {
    this._gridSelector.clearSelectableObjects();

    for (const brickObject of this.brickObjects) {
      this._scene.object.remove(brickObject);
    }
  }

  resetBrickColors() {
    this._brickColorService.clearBrickColorMaterials();

    this.brickColors = [];
    this.brickColors.push(...this._defaultBrickColors.map(x => BrickColor.clone(x)));
  }

  onSaveButtonClicked() {
    const design = new Design();

    design.size = this.grid.size;
    design.bricks = this.brickObjects.map(x => x.brick);
    design.colors = this.brickColors;

    this.promptDownloadJSON(design, 'nanoblock-design');

    this.hasUnsavedChanges = false;
  }

  onLoadFilePicked(file: ReadFile) {
    const base64 = file.content.split(',').pop();

    const jsonString = atob(base64);
    const json: object = JSON.parse(jsonString);

    const jsonConvert: JsonConvert = new JsonConvert();
    const design: Design = jsonConvert.deserializeObject(json, Design);

    if (design) {
      this.loadDesign(design);

      this.hasUnsavedChanges = false;

      this._filePicker.reset();
    }
  }

  promptDownloadJSON(object: any, title: string) {
    const json = JSON.stringify(object);

    const downloader = document.createElement('a');

    const blob = new Blob([json], { type: 'octet/stream' });
    const url = window.URL.createObjectURL(blob);

    downloader.setAttribute('href', url);
    downloader.setAttribute('download', `${title}.json`);
    downloader.click();
    downloader.remove();

    window.URL.revokeObjectURL(url);
  }
}
