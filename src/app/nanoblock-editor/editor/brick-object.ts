import { CELL_SIZE, Cell } from '../objects/grid.directive';
import { Brick, BrickType } from './editor.models';
import { Vector3 } from 'three';
import THREE = require('three');


export class BrickObject {
    object: THREE.Object3D;
    brick: Brick;
    brickType: BrickType;
    cell: Cell;

    get mesh(): THREE.Mesh {
        return <THREE.Mesh>this.object.children[0];
    }

    resetPivot() {
        this.mesh.position.set(0, 0, 0);
        this.brick.pivotX = this.brick.pivotY = this.brick.pivotZ = 0;
    }

    get pivot(): Vector3 {
        return new Vector3(
            this.brick.pivotX,
            this.brick.pivotY,
            this.brick.pivotZ
        );
    }

    get pivotX() {
        return -this.mesh.position.x / CELL_SIZE.x;
    }

    set pivotX(v: number) {
        if (v >= this.brickType.width || v < 0) {
            return;
        }

        if (this.brickType.arrangement[(this.pivotZ * this.brickType.width) + v]) {
            this.mesh.position.setX(-CELL_SIZE.x * v);
            this.brick.pivotX = v;
        }
    }

    get pivotZ() {
        return -this.mesh.position.z / CELL_SIZE.z;
    }

    set pivotZ(v: number) {
        if (v >= this.brickType.depth || v < 0) {
            return;
        }

        if (this.brickType.arrangement[(v * this.brickType.width) + this.pivotX]) {
            this.mesh.position.setZ(-CELL_SIZE.z * v);
            this.brick.pivotZ = v;
        }
    }

    get rotationX() {
        return this.brick.rotationX;
    }

    get rotationY() {
        return this.brick.rotationY;
    }

    set rotationY(v: number) {
        this.brick.rotationY = v;

        if (this.brick.rotationY >= 360 ||
            this.brick.rotationY <= -360) {
            this.brick.rotationY = 0;
        }

        const radians = THREE.Math.degToRad(this.brick.rotationY);

        this.object.setRotationFromAxisAngle(new Vector3(0, 1, 0), radians);
    }

    get rotationZ() {
        return this.brick.rotationZ;
    }
}
