import { Directive, Input, forwardRef, HostListener } from '@angular/core';
import { AbstractCamera } from './abstract-camera';
import * as THREE from 'three';

@Directive({
  selector: 'three-perspective-camera',
  providers: [{ provide: AbstractCamera, useExisting: forwardRef(() => PerspectiveCameraDirective) }],
  exportAs: 'three-perspective-camera'
})
export class PerspectiveCameraDirective extends AbstractCamera<THREE.PerspectiveCamera> {

  // @Input() cameraTarget: THREE.Object3D;

  @Input() fov: number;
  @Input() near: number;
  @Input() far: number;

  @Input() positionX: number;
  @Input() positionY: number;
  @Input() positionZ: number;


  constructor() {

    super();
  }

  protected afterInit(): void {

    // let aspectRatio = undefined; // Updated later
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      undefined,
      this.near,
      this.far
    );

    // Set position and look at
    this.camera.position.x = this.positionX;
    this.camera.position.y = this.positionY;
    this.camera.position.z = this.positionZ;
    this.camera.updateProjectionMatrix();
  }

  public updateAspectRatio(aspect: number) {

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }


}
