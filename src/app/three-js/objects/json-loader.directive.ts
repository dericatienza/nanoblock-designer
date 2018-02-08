import { Directive, forwardRef, Input } from '@angular/core';
import * as THREE from 'three';
import { AbstractObject3D } from './index';
import { Geometry, Material } from 'three';

@Directive({
  selector: 'three-json-loader',
  providers: [{ provide: AbstractObject3D, useExisting: forwardRef(() => JsonLoaderDirective) }]
})
export class JsonLoaderDirective extends AbstractObject3D<THREE.Object3D> {

  @Input() model: string;

  constructor() {
    super();
    console.log('JsonLoaderDirective.constructor');
  }

  protected newObject3DInstance(): THREE.Object3D {
    console.log('JsonLoaderDirective.newObject3DInstance');
    return new THREE.Object3D();
  }

  protected afterInit(): void {
    console.log('JsonLoaderDirective.afterInit');
    const loader = new THREE.JSONLoader();
    loader.load(this.model, this.onJSONLoaded.bind(this));

  }

  private onJSONLoaded(geometry: Geometry, materials: Material[]) {
    console.log('JsonLoaderDirective.onObjectLoaded');

    let material: Material;

    if (materials === undefined || materials.length < 1) {
      material = new THREE.MeshNormalMaterial();
    } else {
      material = materials[0];
    }
    const object = new THREE.Mesh(geometry, material);

    this.addChild(object);
  }

}
