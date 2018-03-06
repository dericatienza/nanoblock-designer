import { CELL_SIZE, Cell } from '../objects/grid.directive';
import { Brick, BrickType } from './editor.models';
import { Vector3 } from 'three';


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
    }

    get pivot(): Vector3 {
        return new Vector3(
            Math.abs(this.mesh.position.x / CELL_SIZE.x),
            Math.abs(this.mesh.position.y / CELL_SIZE.y),
            Math.abs(this.mesh.position.z / CELL_SIZE.z),
        );
    }

    // set pivot(v: Vector3) {
    //   this.mesh.position.set(
    //     CELL_SIZE.x * v.x,
    //     CELL_SIZE.y * v.y,
    //     CELL_SIZE.z * v.z);
    // }

    get pivotX() {
        return Math.abs(this.mesh.position.x / CELL_SIZE.x);
    }

    set pivotX(v: number) {
        if (v >= this.brickType.width || v < 0) {
            return;
        }

        if (this.brickType.arrangement[(this.pivotZ * this.brickType.width) + v]) {
            this.mesh.position.setX(-CELL_SIZE.x * v);
        }
    }

    get pivotZ() {
        return Math.abs(this.mesh.position.z / CELL_SIZE.z);
    }

    set pivotZ(v: number) {
        if (v >= this.brickType.depth || v < 0) {
            return;
        }

        if (this.brickType.arrangement[(v * this.brickType.width) + this.pivotX]) {
            this.mesh.position.setZ(-CELL_SIZE.z * v);
        }
    }
}
