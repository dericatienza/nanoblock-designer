import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType, BrickColor } from './editor/editor.models';
import * as THREE from 'three';
import { Material, MeshPhongMaterial } from 'three';

export const CLEAR_COLOR_OPACITY = 0.5;

@Injectable()
export class BrickColorService {
  brickColorsUrl = 'assets/default-brick-colors.json';

  constructor(private _http: HttpClient) { }

  getDefaultBrickColors() {
    return this._http.get<BrickColor[]>(this.brickColorsUrl);
  }

  getBrickColorMaterial(brickColor: BrickColor): Material {
    const opacity = brickColor.isClear ? CLEAR_COLOR_OPACITY : 1;

    const material = new MeshPhongMaterial(
      {
        color: brickColor.colorHex,
        opacity: opacity,
        transparent: brickColor.isClear
      }
    );

    return material;
  }
}
