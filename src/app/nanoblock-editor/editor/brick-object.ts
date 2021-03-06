import { CELL_SIZE, Cell } from '../objects/grid.directive';
import { Brick, BrickType, BrickColor } from './editor.models';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { PivotObject3D } from './pivot-object';


export class BrickObject extends PivotObject3D {
    brick: Brick;
    brickType: BrickType;
    brickColor: BrickColor;
    cell: Cell;

    get mesh(): THREE.Mesh {
        return <THREE.Mesh>this.pivot.children[0];
    }

    resetPivot() {
        this.pivot.position.set(0, 0, 0);
        this.brick.pivotX = this.brick.pivotY = this.brick.pivotZ = 0;
    }

    get brickPivot(): Vector3 {
        return new Vector3(
            this.brick.pivotX,
            this.brick.pivotY,
            this.brick.pivotZ
        );
    }

    get brickPivotX() {
        return -this.pivot.position.x / CELL_SIZE.x;
    }

    set brickPivotX(v: number) {
        if (v >= this.brickType.width || v < 0) {
            return;
        }

        if (this.brickType.arrangement[(this.brickPivotZ * this.brickType.width) + v]) {
            this.pivot.position.setX(-CELL_SIZE.x * v);
            this.brick.pivotX = v;
        }
    }

    get brickPivotZ() {
        return -this.pivot.position.z / CELL_SIZE.z;
    }

    set brickPivotZ(v: number) {
        if (v >= this.brickType.depth || v < 0) {
            return;
        }

        if (this.brickType.arrangement[(v * this.brickType.width) + this.brickPivotX]) {
            this.pivot.position.setZ(-CELL_SIZE.z * v);
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

        this.setRotationFromAxisAngle(new Vector3(0, 1, 0), radians);
    }

    get rotationZ() {
        return this.brick.rotationZ;
    }
}
