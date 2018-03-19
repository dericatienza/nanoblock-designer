import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-grid-helper',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => GridHelperDirective) }],
  exportAs: 'three-grid-helper'
})
export class GridHelperDirective extends AbstractObject3D<THREE.GridHelper> {

  @Input() size: number;
  @Input() divisions: number;

  get divisionSize(): number {
    return this.size / this.divisions;
  }

  constructor() {
    super();
  }

  protected newObject3DInstance(): THREE.GridHelper {
    return new THREE.GridHelper(this.size, this.divisions);
  }

  protected afterInit(): void {
  }

}
