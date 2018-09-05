import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-axes-helper',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => AxesHelperDirective) }]
})
export class AxesHelperDirective extends AbstractObject3D<THREE.AxesHelper> {

  @Input() size: number;

  constructor() {
    super();

  }

  protected newObject3DInstance(): THREE.AxesHelper {

    return new THREE.AxesHelper(this.size);
  }

  protected afterInit(): void {

    // none
  }

}
