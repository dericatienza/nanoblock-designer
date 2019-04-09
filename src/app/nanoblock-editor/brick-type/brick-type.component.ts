import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { BrickType, BrickColor } from '../editor/editor.models';
import { SceneDirective } from '../../three-js/objects';
import { Mesh, MeshNormalMaterial } from 'three';
import { BrickTypeService } from '../brick-type.service';
import { BrickColorService } from '../brick-color.service';
import * as three from 'three';

import '../../../assets/js/OutlinesGeometry';
import { BRICK_OUTLINE_MATERIAL } from '../editor/editor.component';
import { OrthographicCameraDirective } from '../../three-js/cameras/orthographic-camera.directive';
import { CELL_SIZE } from '../objects/grid.directive';

declare var THREE: any;

@Component({
    selector: 'ne-brick-type',
    templateUrl: './brick-type.component.html',
    styleUrls: ['./brick-type.component.scss']
})
export class BrickTypeComponent implements OnInit, AfterViewInit {

    @ViewChild('scene')
    private _scene: SceneDirective;

    @ViewChild('mainCamera')
    private _mainCamera: OrthographicCameraDirective;

    @Input() brickType: BrickType;

    private _brickColor: BrickColor;
    get brickColor(): BrickColor {
        return this._brickColor;
    }

    @Input()
    set brickColor(v: BrickColor) {
        this._brickColor = v;

        if (this.mesh) {
            this.mesh.material = this._brickColorService.getBrickColorMaterial(this.brickColor);
        }
    }

    mesh: Mesh;

    constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.mesh = this._brickTypeService.getBrickTypeMesh(this.brickType);

        this.mesh.material = this._brickColorService.getBrickColorMaterial(this.brickColor);

        const studSize = this._brickTypeService.studSize;

        this.mesh.position.set(
            (this.brickType.width - 1) * -studSize.x / 2,
            (this.brickType.height - 1) * -studSize.y / 2,
            (this.brickType.depth - 1) * -studSize.z / 2
        );

        this._scene.object.add(this.mesh);

        const cameraZoom = Math.min((10 * 2) / (Math.max(this.brickType.width, this.brickType.depth) * CELL_SIZE.x), 1);

        this._mainCamera.camera.zoom = cameraZoom;

        this._mainCamera.camera.updateProjectionMatrix();
    }

}
