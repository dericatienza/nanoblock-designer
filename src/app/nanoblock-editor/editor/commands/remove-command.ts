import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';
import { BuildCommand } from './build-command';
import { EraseCommand } from './erase-command';

export class RemoveCommand extends EraseCommand {
    rotationY: number;
    pivotZ: number;
    pivotX: number;

    constructor(brickObject: BrickObject) {
        super(brickObject);
    }
    do(editor: EditorComponent) {
        this.pivotZ = this.brickObject.brickPivotZ;
        this.pivotX = this.brickObject.brickPivotX;

        this.rotationY = this.brickObject.rotationY;

        const preDoBrickCells = editor.snapshotBrickCells();

        editor.removeBrickObject(this.brickObject);

        editor.removeUnmovedBrickObject(preDoBrickCells);

        this.preDoBrickCells = preDoBrickCells;
    }
    undo(editor: EditorComponent) {
        editor.currentBrickColor = this.brickObject.brickColor;

        editor.refreshBrickColor(this.brickObject);

        super.undo(editor);

        this.brickObject.brickPivotZ = this.pivotZ;
        this.brickObject.brickPivotX = this.pivotX;

        this.brickObject.rotationY = this.rotationY;

        editor.setMode('select');
    }
}
