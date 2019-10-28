import { Directive, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-directional-light',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => DirectionalLightDirective) }]
})
export class DirectionalLightDirective extends AbstractObject3D<THREE.DirectionalLight> {

  @Input() color: THREE.Color;
  @Input() intensity: number;

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.DirectionalLight {
    return new THREE.DirectionalLight(this.color, this.intensity);
  }

  protected afterInit(): void {
  }
}
