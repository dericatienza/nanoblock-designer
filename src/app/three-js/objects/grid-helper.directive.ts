import { Directive, Input, AfterViewInit, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';
import { MeshBasicMaterial } from 'three';

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
    console.log('GridHelperDirective.constructor');
  }

  protected newObject3DInstance(): THREE.GridHelper {
    console.log('GridHelperDirective.newObject3DInstance');
    return new THREE.GridHelper(this.size, this.divisions);
  }

  protected afterInit(): void {
    console.log('GridHelperDirective.afterInit');
  }

}
