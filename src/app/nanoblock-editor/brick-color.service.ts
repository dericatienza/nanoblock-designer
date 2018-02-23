import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType, BrickColor } from './editor/editor.models';
import * as THREE from 'three';
import { Material, MeshPhongMaterial } from 'three';

@Injectable()
export class BrickColorService {
  brickColorsUrl = 'assets/default-brick-colors.json';

  constructor(private _http: HttpClient) { }

  getDefaultBrickColors() {
    return this._http.get<BrickColor[]>(this.brickColorsUrl);
  }

  getBrickColorMaterial(brickColor: BrickColor): Material {
    const opacity = brickColor.isClear ? 0.5 : 1;

    const material = new MeshPhongMaterial(
      {
        color: brickColor.colorHex,
        opacity: opacity
      }
    );

    return material;
  }
}
