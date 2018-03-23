import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';
import { BuildCommand } from './build-command';

export class EraseCommand extends Command {
    preDoBrickCells: Map<BrickObject, Cell>;

    brickObject: BrickObject;
    cell: Cell;

    constructor(brickObject: BrickObject) {
        super();
        this.brickObject = brickObject;
        this.cell = brickObject.cell;
    }
    do(editor: EditorComponent) {
        const preDoBrickCells = editor.snapshotBrickCells();

        editor.destroyBrickObject(this.brickObject);

        editor.removeUnmovedBrickObject(preDoBrickCells);

        this.preDoBrickCells = preDoBrickCells;
    }
    undo(editor: EditorComponent) {
        editor.buildBrickObject(this.brickObject, this.cell);

        if (this.preDoBrickCells) {
            this.preDoBrickCells.forEach((value: Cell, key: BrickObject) => {
                editor.moveBrickObject(key, value);
            });
        }
    }
}
