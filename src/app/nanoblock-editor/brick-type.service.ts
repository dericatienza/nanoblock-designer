import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType } from './editor/editor.models';
import * as three from 'three';
import '../../assets/js/ThreeCSG';
import 'rxjs/add/operator/map';
import { Geometry, Material, Vector3, BufferGeometry, BoxGeometry, Mesh } from 'three';
import { BrickObject } from './editor/brick-object';
import { BRICK_OUTLINE_MATERIAL } from './editor/editor.component';

declare var THREE: any;

const HIGHLIGHT_SCALE_FACTOR = 1.1;

@Injectable()
export class BrickTypeService {
    studUrl = 'assets/models/nanoblock-blender.json';
    studGeometry: Geometry;
    studHighlightGeometry: Geometry;

    brickTypesUrl = 'assets/brick-types.json';

    private _brickTypeGeometries: Map<number, BufferGeometry>;
    private _brickTypeHighlightGeometries: Map<number, BufferGeometry>;

    private _brickTypeMeshes: Map<number, Mesh>;

    get studSize(): Vector3 {
        return this.studGeometry.boundingBox.getSize();
    }

    constructor(private _http: HttpClient) {
        this._brickTypeGeometries = new Map<number, BufferGeometry>();
        this._brickTypeHighlightGeometries = new Map<number, BufferGeometry>();
        this._brickTypeMeshes = new Map<number, Mesh>();
        this.initStud();
    }

    initStud() {
        const loader = new three.JSONLoader();
        loader.load(this.studUrl,
            (geometry: Geometry, materials: Material[]) => {
                this.studGeometry = geometry;
                this.studGeometry.computeBoundingBox();

                const studSize = this.studGeometry.boundingBox.getSize();
                this.studHighlightGeometry = new BoxGeometry(studSize.x, studSize.y, studSize.z);
                this.studHighlightGeometry.translate(0, studSize.y / 2, 0);
            });
    }

    getBrickTypes() {
        return this._http.get<BrickType[]>(this.brickTypesUrl);
    }

    getBrickTypeHighlightGeometry(brickType: BrickType): BufferGeometry {
        if (this._brickTypeHighlightGeometries.has(brickType.id)) {
            return this._brickTypeHighlightGeometries.get(brickType.id);
        }

        this.getBrickTypeGeometry(brickType);

        return this._brickTypeHighlightGeometries.get(brickType.id);
    }

    getBrickTypeMesh(brickType: BrickType): Mesh {
        if (this._brickTypeMeshes.has(brickType.id)) {
            return this._brickTypeMeshes.get(brickType.id).clone();
        }

        const geometry = this.getBrickTypeGeometry(brickType);

        const mesh = new three.Mesh(geometry);

        const outlinesGeometry = new THREE.OutlinesGeometry(geometry, 45);
        const outline = new three.LineSegments(outlinesGeometry, BRICK_OUTLINE_MATERIAL);
        mesh.add(outline);

        this._brickTypeMeshes.set(brickType.id, mesh);

        return mesh.clone();
    }

    getBrickTypeGeometry(brickType: BrickType): BufferGeometry {
        if (this._brickTypeGeometries.has(brickType.id)) {
            return this._brickTypeGeometries.get(brickType.id);
        }

        const studSize = this.studGeometry.boundingBox.getSize();

        let studCSG = THREE.CSG.toCSG(this.studGeometry);
        let studHighlightCSG = THREE.CSG.toCSG(this.studHighlightGeometry);

        const studCSGClones = [];
        const studHighlightCSGClones = [];

        for (let z = 0; z < brickType.depth; z++) {
            for (let x = 0; x < brickType.width; x++) {
                if (!brickType.arrangement[(z * brickType.width) + x]) {
                    continue;
                }

                const studGeometry = this.studGeometry.clone();
                const studHighlightGeometry = this.studHighlightGeometry.clone();

                studGeometry.translate(x * studSize.x, 0, z * studSize.z);
                studHighlightGeometry.translate(x * studSize.x, 0, z * studSize.z);

                const studCSGClone = THREE.CSG.toCSG(studGeometry);
                const studHighlightCSGClone = THREE.CSG.toCSG(studHighlightGeometry);

                studCSGClones.push(studCSGClone);
                studHighlightCSGClones.push(studHighlightCSGClone);
            }
        }

        studCSG = studCSG.union(studCSGClones);
        studHighlightCSG = studHighlightCSG.union(studHighlightCSGClones);

        const geometry = <BufferGeometry>THREE.CSG.fromCSG(studCSG);
        const highlightGeometry = <BufferGeometry>THREE.CSG.fromCSG(studHighlightCSG);

        geometry.computeBoundingBox();

        const geometrySize = geometry.boundingBox.getSize();

        const positionCorrection = new three.Vector3(
            ((geometrySize.x * HIGHLIGHT_SCALE_FACTOR) - geometrySize.x) / -2,
            0,
            ((geometrySize.z * HIGHLIGHT_SCALE_FACTOR) - geometrySize.z) / -2
        );

        highlightGeometry.translate(studSize.x / 2, 0, studSize.z / 2);

        highlightGeometry.scale(HIGHLIGHT_SCALE_FACTOR, 1, HIGHLIGHT_SCALE_FACTOR);
        highlightGeometry.translate(positionCorrection.x, positionCorrection.y, positionCorrection.z);

        highlightGeometry.translate(-studSize.x / 2, 0, -studSize.z / 2);

        this._brickTypeGeometries.set(brickType.id, geometry);
        this._brickTypeHighlightGeometries.set(brickType.id, highlightGeometry);

        return geometry;
    }
}
