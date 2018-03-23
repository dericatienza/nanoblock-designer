import * as THREE from 'three';

export class PivotObject3D extends THREE.Object3D {

    pivot: THREE.Object3D;

    constructor() {
        super();

        this.pivot = new THREE.Object3D();

        super.add(this.pivot);
    }

    add(...object: THREE.Object3D[]) {
        this.pivot.add(...object);
    }

    remove(...object: THREE.Object3D[]) {
        this.pivot.remove(...object);
    }
}
