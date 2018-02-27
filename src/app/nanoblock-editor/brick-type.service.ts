import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType } from './editor/editor.models';
import * as THREE from 'three';
import '../../assets/js/ThreeCSG';
import 'rxjs/add/operator/map';
import { Geometry, Material } from 'three';

declare var ThreeBSP: any;

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
    const rows = brickType.height;
    const columns = brickType.width;

    this.studGeometry.computeBoundingBox();

    const studSize = this.studGeometry.boundingBox.getSize();

    let studBSP = new ThreeBSP(this.studGeometry);

    for (let x = 0; x < rows; x++) {
      for (let y = 0; y < columns; y++) {
        if (!brickType.arrangement[(x * columns) + y]) {
          continue;
        }

        const studGeometry = this.studGeometry.clone();

        studGeometry.translate(y * studSize.x, 0, x * studSize.z);

        const studBSPClone = new ThreeBSP(studGeometry);

        studBSP = studBSP.union(studBSPClone);
      }
    }

    const geometry = studBSP.toGeometry();

    return geometry;
  }
}
