import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-point-light',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => PointLightDirective) }]
})
export class PointLightDirective extends AbstractObject3D<THREE.PointLight> {

  @Input() color: THREE.Color;
  @Input() intensity: number;
  @Input() distance: number;

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.PointLight {
    return new THREE.PointLight(this.color, this.intensity, this.distance);
  }

  protected afterInit(): void {
  }
}
