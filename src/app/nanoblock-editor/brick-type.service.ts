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
    this.studGeometry.computeBoundingBox();

    const studSize = this.studGeometry.boundingBox.getSize();

    let studBSP = new ThreeBSP(this.studGeometry);

    for (let z = 0; z < brickType.depth; z++) {
      for (let x = 0; x < brickType.width; x++) {
        if (!brickType.arrangement[(z * brickType.width) + x]) {
          continue;
        }

        const studGeometry = this.studGeometry.clone();

        studGeometry.translate(x * studSize.x, 0, z * studSize.z);

        const studBSPClone = new ThreeBSP(studGeometry);

        studBSP = studBSP.union(studBSPClone);
      }
    }

    const geometry = studBSP.toGeometry();

    return geometry;
  }
}
