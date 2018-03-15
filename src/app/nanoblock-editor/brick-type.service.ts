import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType } from './editor/editor.models';
import * as THREE from 'three';
import '../../assets/js/ThreeCSG';
import 'rxjs/add/operator/map';
import { Geometry, Material, Vector3, BufferGeometry } from 'three';
import { SimplifyModifier } from '../three-js/modifiers/simplify-modifier';

declare var ThreeBSP: any;
@Injectable()
export class BrickTypeService {
  studUrl = 'assets/models/nanoblock-blender.json';
  studGeometry: Geometry;

  brickTypesUrl = 'assets/brick-types.json';

  private _brickTypeGeometries: Map<number, BufferGeometry>;

  simplifyModifier = new SimplifyModifier();

  get studSize(): Vector3 {
    return this.studGeometry.boundingBox.getSize();
  }

  constructor(private _http: HttpClient) {
    this._brickTypeGeometries = new Map<number, BufferGeometry>();
    this.initStud();
  }

  initStud() {
    const loader = new THREE.JSONLoader();
    loader.load(this.studUrl,
      (geometry: Geometry, materials: Material[]) => {
        this.studGeometry = geometry;
        this.studGeometry.computeBoundingBox();
      });
  }

  getBrickTypes() {
    return this._http.get<BrickType[]>(this.brickTypesUrl);
  }

  getBrickTypeGeometry(brickType: BrickType): BufferGeometry {
    if (this._brickTypeGeometries.has(brickType.id)) {
      return this._brickTypeGeometries.get(brickType.id);
    }

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

    // tslint:disable-next-line:prefer-const
    let geometry = studBSP.toGeometry();
    // tslint:disable-next-line:no-bitwise
    // geometry = this.simplifyModifier.modify(geometry, geometry.vertices.length * 0.5 | 0);

    geometry.computeBoundingBox();

    this._brickTypeGeometries.set(brickType.id, geometry);

    return geometry;
  }
}
