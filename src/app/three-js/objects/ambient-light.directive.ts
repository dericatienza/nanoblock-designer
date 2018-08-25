import { Directive, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-ambient-light',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => AmbientLightDirective) }]
})
export class AmbientLightDirective extends AbstractObject3D<THREE.AmbientLight> {

  @Input() color: THREE.Color;
  @Input() intensity: number;

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.AmbientLight {
    return new THREE.AmbientLight(this.color, this.intensity);
  }

  protected afterInit(): void {
  }
}
