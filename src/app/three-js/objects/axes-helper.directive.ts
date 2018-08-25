import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-axes-helper',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => AxesHelperDirective) }]
})
export class AxesHelperDirective extends AbstractObject3D<THREE.AxisHelper> {

  @Input() size: number;

  constructor() {
    super();

  }

  protected newObject3DInstance(): THREE.AxisHelper {

    return new THREE.AxisHelper(this.size);
  }

  protected afterInit(): void {

    // none
  }

}
