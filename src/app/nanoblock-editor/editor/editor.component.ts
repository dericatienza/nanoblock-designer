import { Component, OnInit, ViewChild } from '@angular/core';
import { SceneDirective } from '../../three-js/objects/index';
import { AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { GridSelectorDirective } from '../objects/grid-selector.directive';
import { BrickType } from './editor.models';
import { Response } from '@angular/http';

import { BrickTypeService } from '../brick-type.service';
import { Geometry } from 'three';

@Component({
  selector: 'ne-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit, AfterViewInit {

  @ViewChild('scene')
  private _scene: SceneDirective;

  @ViewChild('gridSelector')
  private _gridSelector: GridSelectorDirective;

  private _brickTypes: BrickType[];
  private _brickTypeGeometries: Map<number, Geometry>;

  constructor(private _brickTypeService: BrickTypeService) {
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

  ngOnInit() {
    this.initBrickTypes();
  }

  ngAfterViewInit(): void {
  }
}
