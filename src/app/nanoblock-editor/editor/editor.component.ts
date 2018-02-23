import { Component, OnInit, ViewChild } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { BrickType, Brick, BrickColor } from './editor.models';
import { Response } from '@angular/http';

import { BrickTypeService } from '../brick-type.service';
import * as THREE from 'three';
import { Geometry } from 'three';
import { BrickColorService } from '../brick-color.service';
import { GridDirective, CELL_SIZE, Cell } from '../objects/grid.directive';

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

  private _brickTypes: BrickType[];
  private _brickColors: BrickColor[];
  private _brickTypeGeometries: Map<number, Geometry>;

  constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) {
  }

  initBrickTypes(): void {
    this._brickTypeService.getBrickTypes()
      .subscribe((brickTypes: BrickType[]) => {
        this._brickTypes = brickTypes;
        this.initBrickTypeGeometries();
      });
  }

  initBrickTypeGeometries() {
    this._brickTypeGeometries = new Map<number, Geometry>();

    for (const brickType of this._brickTypes) {
      this._brickTypeGeometries.set(brickType.id, this._brickTypeService.getBrickTypeGeometry(brickType));
    }
  }

  initBrickColors() {
    this._brickColorService.getDefaultBrickColors()
      .subscribe((brickColors: BrickColor[]) => {
        this._brickColors = brickColors;

        this.testBrickTypes();
      });
  }

  ngOnInit() {
    this.initBrickTypes();
    this.initBrickColors();
  }

  testBrickTypes() {
    const color = this._brickColors[0];

    let startX = this._grid.width / -2;

    for (let x = 0; x < this._brickTypes.length; x++) {
      const brickType = this._brickTypes[x];

      const brickObject = this.createBrick(brickType, color);

      this._scene.object.add(brickObject.object);

      brickObject.object.position.set(startX, 0, 0);
      brickObject.object.translateX(CELL_SIZE / 2);
      brickObject.object.translateZ(CELL_SIZE / 2);

      startX += (CELL_SIZE * brickType.width) + CELL_SIZE;
    }
  }

  createBrick(type: BrickType, color: BrickColor): BrickObject {
    const geometry = this._brickTypeGeometries.get(type.id);

    const material = this._brickColorService.getBrickColorMaterial(color);

    const mesh = new THREE.Mesh(geometry, material);

    const brickObject = new BrickObject();
    brickObject.object = mesh;

    return brickObject;
  }

  ngAfterViewInit(): void {
  }
}

export class BrickObject {
  object: THREE.Object3D;
}
