import { Directive, AfterViewInit, Input, forwardRef } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './abstract-object-3d';

@Directive({
  selector: 'three-scene',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => SceneDirective) }],
  exportAs: 'three-scene'
})
export class SceneDirective extends AbstractObject3D<THREE.Scene> {

  constructor() {

    super();
  }

  protected afterInit(): void {

  }

  protected newObject3DInstance(): THREE.Scene {

    return new THREE.Scene();
  }

}
