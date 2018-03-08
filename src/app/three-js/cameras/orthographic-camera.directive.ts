import { Directive, Input, forwardRef, HostListener } from '@angular/core';
import { AbstractCamera } from './abstract-camera';
import * as THREE from 'three';

@Directive({
    selector: 'three-orthographic-camera',
    providers: [{ provide: AbstractCamera, useExisting: forwardRef(() => OrthographicCameraDirective) }],
    exportAs: 'three-orthographic-camera'
})
export class OrthographicCameraDirective extends AbstractCamera<THREE.OrthographicCamera> {

    // @Input() cameraTarget: THREE.Object3D;

    @Input() height: number;
    @Input() near: number;
    @Input() far: number;

    @Input() positionX: number;
    @Input() positionY: number;
    @Input() positionZ: number;


    constructor() {
        super();
    }

    protected afterInit(): void {
        const aspect = 1;

        this.camera = new THREE.OrthographicCamera(
            -this.height * aspect,
            this.height * aspect,
            this.height,
            -this.height,
            this.near,
            this.far
        );

        // Set position and look at
        this.camera.position.x = this.positionX;
        this.camera.position.y = this.positionY;
        this.camera.position.z = this.positionZ;

        this.camera.lookAt(0, 0, 0);
    }

    public updateAspectRatio(aspect: number) {
        this.camera.left = -this.height * aspect;
        this.camera.right = this.height * aspect;
        this.camera.top = this.height;
        this.camera.bottom = -this.height;

        this.camera.updateProjectionMatrix();
    }


}
