import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType } from './editor/editor.models';
import * as THREE from 'three';
import 'rxjs/add/operator/map';
import { Geometry, Material } from 'three';

@Injectable()
export class BrickTypeService {
  studUrl = 'assets/models/nanoblock-blender.json';
  studGeometry: Geometry;

  brickTypesUrl = 'assets/brick-types.json';

  constructor(private _http: HttpClient) {
    this.initStud();
  }

  initStud() {
    const loader = new THREE.JSONLoader();
    loader.load(this.studUrl,
      (geometry: Geometry, materials: Material[]) => {
        this.studGeometry = geometry;
      });
  }

  getBrickTypes() {
    return this._http.get<BrickType[]>(this.brickTypesUrl);
  }

  getBrickTypeGeometry(brickType: BrickType) {
    const geometry = new Geometry();

    const rows = brickType.height;
    const columns = brickType.width;

    this.studGeometry.computeBoundingBox();

    const studSize = this.studGeometry.boundingBox.getSize();

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const studGeometry = this.studGeometry.clone();

        studGeometry.translate(x * studSize.x, 0, y * studSize.z);

        geometry.merge(studGeometry);
      }
    }

    return geometry;
  }
}
