import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { BrickType, BrickColor } from '../editor/editor.models';
import { SceneDirective } from '../../three-js/objects';
import { Mesh, MeshNormalMaterial, Scene, WebGLRenderer, OrthographicCamera, AmbientLight, PointLight } from 'three';
import { BrickTypeService } from '../brick-type.service';
import { BrickColorService } from '../brick-color.service';
import * as three from 'three';

import { OrthographicCameraDirective } from '../../three-js/cameras/orthographic-camera.directive';
import { CELL_SIZE } from '../objects/grid.directive';

declare var THREE: any;

@Component({
    selector: 'ne-brick-type',
    templateUrl: './brick-type.component.html',
    styleUrls: ['./brick-type.component.scss']
})
export class BrickTypeComponent implements OnInit, AfterViewInit {
    @ViewChild('canvas')
    private canvasRef: ElementRef;

    private _scene: Scene;

    private _mainCamera: OrthographicCamera;

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

    context: CanvasRenderingContext2D;

    private _cameraSize = 10;

    get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    constructor(private _brickTypeService: BrickTypeService, private _brickColorService: BrickColorService) { }

    ngOnInit() {
        this._scene = new Scene();
    }

    ngAfterViewInit(): void {
        const ambientLight = new AmbientLight('white', .4);

        this._scene.add(ambientLight);

        const pointLight1 = new PointLight('white', 1, 1000);
        pointLight1.position.set(40, 80, 80);

        this._scene.add(pointLight1);

        const pointLight2 = new PointLight('white', 1, 1000);
        pointLight2.position.set(-40, 80, -80);

        this._scene.add(pointLight2);

        this.mesh = this._brickTypeService.getBrickTypeMesh(this.brickType);

        this.mesh.material = this._brickColorService.getBrickColorMaterial(this.brickColor);

        const studSize = this._brickTypeService.studSize;

        this.mesh.position.set(
            (this.brickType.width - 1) * -studSize.x / 2,
            (this.brickType.height - 1) * -studSize.y / 2,
            (this.brickType.depth - 1) * -studSize.z / 2
        );

        this._scene.add(this.mesh);

        this.setupCamera();

        this.context = this.canvas.getContext('2d');
    }

    public setupCamera() {
        const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;

        this._mainCamera = new OrthographicCamera(
            -this._cameraSize * aspectRatio,
            this._cameraSize * aspectRatio,
            this._cameraSize,
            -this._cameraSize,
            -1000,
            1000
        );

        this._mainCamera.position.set(this._cameraSize, this._cameraSize, this._cameraSize);

        this._mainCamera.lookAt(0, 0, 0);

        const cameraZoom = Math.min(
            (this._cameraSize * 2) / (Math.max(this.brickType.width, this.brickType.depth) * CELL_SIZE.x),
            1);

        this._mainCamera.zoom = cameraZoom;

        this._mainCamera.updateProjectionMatrix();
    }

    public updateCameraAspectRatio() {
        const aspectRatio = this.canvas.clientWidth / this.canvas.clientHeight;

        this._mainCamera.left = -this._cameraSize * aspectRatio;
        this._mainCamera.right = this._cameraSize * aspectRatio;
        this._mainCamera.top = this._cameraSize;
        this._mainCamera.bottom = -this._cameraSize;

        this._mainCamera.updateProjectionMatrix();
    }

    render(renderer: WebGLRenderer) {
        renderer.setSize(this.canvas.clientWidth * 2, this.canvas.clientHeight); // Multiplying width by 2 works for some reason

        renderer.render(this._scene, this._mainCamera);

        this.context.clearRect(0, 0, this.canvas.clientWidth * 2, this.canvas.clientHeight);
        this.context.drawImage(renderer.domElement, 0, 0);
    }
}
