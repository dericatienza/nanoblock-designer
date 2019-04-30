import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JsonConvert } from 'json2typescript';
import { BrickType } from './editor/editor.models';
import * as three from 'three';
import 'rxjs/add/operator/map';
import { Geometry, Material, Vector3, BufferGeometry, BoxGeometry, Mesh, Scene, EdgesGeometry } from 'three';
import { BrickObject } from './editor/brick-object';
import { BRICK_OUTLINE_MATERIAL } from './editor/editor.component';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CELL_SIZE } from './objects/grid.directive';

const HIGHLIGHT_SCALE_FACTOR = 1.1;

@Injectable()
export class BrickTypeService {
    bricksUrl = 'assets/models/nanoblock-bricks-v2.glb';
    studGeometry: BufferGeometry;
    studHighlightGeometry: Geometry;

    brickTypesUrl = 'assets/brick-types.json';

    private _brickTypeGeometries: Map<number, BufferGeometry>;

    private _brickTypeHighlightMeshes: Map<number, Mesh>;
    private _brickTypeMeshes: Map<number, Mesh>;

    public studSize = new Vector3(CELL_SIZE.x, CELL_SIZE.y, CELL_SIZE.z);

    constructor(private _http: HttpClient) {
        this._brickTypeGeometries = new Map<number, BufferGeometry>();
        this._brickTypeHighlightMeshes = new Map<number, Mesh>();
        this._brickTypeMeshes = new Map<number, Mesh>();
    }

    initBrickTypes(onFinish: () => void) {
        const loader = new GLTFLoader();
        loader.load(this.bricksUrl,
            (gltf) => {
                const brickTypeMeshes = (<Scene>(gltf.scene)).children;

                for (let x = 0; x < brickTypeMeshes.length; x++) {
                    const mesh = <Mesh>brickTypeMeshes[x];

                    const id = Number(mesh.name);
                    const bufferGeometry = <three.BufferGeometry>mesh.geometry;

                    bufferGeometry.rotateY(-90 * three.Math.DEG2RAD); // Temporary fix for blender exports' wrong rotation

                    const highlightBoundsOffset = 0.8;

                    const highlightGeometry = this.getHighlightGeometry(bufferGeometry, highlightBoundsOffset);

                    const highlightMesh = new three.Mesh(highlightGeometry);

                    this._brickTypeGeometries.set(id, bufferGeometry);
                    this._brickTypeHighlightMeshes.set(id, highlightMesh);
                }

                onFinish();
            });
    }

    private getHighlightGeometry(geometry: BufferGeometry | Geometry, offset: number): BufferGeometry | Geometry {
        geometry.computeBoundingBox();

        const geometryBounds = new three.Vector3();

        geometry.boundingBox.getSize(geometryBounds);

        const highlightBounds = new three.Vector3(
            geometryBounds.x + (offset * 2),
            geometryBounds.y + (offset * 2),
            geometryBounds.z + (offset * 2)
        );

        const highlightGeometry = geometry.clone();

        highlightGeometry.translate(
            CELL_SIZE.x / 2,
            0,
            CELL_SIZE.z / 2
        );

        highlightGeometry.scale(
            highlightBounds.x / geometryBounds.x,
            highlightBounds.y / geometryBounds.y,
            highlightBounds.z / geometryBounds.z,
        );

        highlightGeometry.translate(
            -offset - CELL_SIZE.x / 2,
            -offset,
            -offset - CELL_SIZE.z / 2
        );

        return highlightGeometry;
    }

    getBrickTypes() {
        return this._http.get<BrickType[]>(this.brickTypesUrl);
    }

    getBrickTypeHighlightMesh(brickType: BrickType): Mesh {
        return this._brickTypeHighlightMeshes.get(brickType.id);
    }

    getBrickTypeMesh(brickType: BrickType): Mesh {
        if (this._brickTypeMeshes.has(brickType.id)) {
            return this._brickTypeMeshes.get(brickType.id).clone();
        }

        const geometry = this._brickTypeGeometries.get(brickType.id);

        const mesh = new three.Mesh(geometry);

        const outlinesGeometry = new EdgesGeometry(geometry, 45);
        const outline = new three.LineSegments(outlinesGeometry, BRICK_OUTLINE_MATERIAL);
        mesh.add(outline);

        this._brickTypeMeshes.set(brickType.id, mesh);

        return mesh.clone();
    }
}
