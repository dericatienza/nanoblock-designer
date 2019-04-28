import * as THREE from 'three';

export class PivotObject3D extends THREE.Object3D {

    pivot: THREE.Object3D;

    constructor() {
        super();

        this.pivot = new THREE.Object3D();

        super.add(this.pivot);
    }

    add(...object: THREE.Object3D[]): this {
        this.pivot.add(...object);

        return this;
    }

    remove(...object: THREE.Object3D[]): this {
        this.pivot.remove(...object);

        return this;
    }
}
