import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';

export class BuildCommand extends Command {
    preDoBrickCells: Map<BrickObject, Cell>;

    brickObject: BrickObject;
    cell: Cell;

    constructor(brickObject: BrickObject, cell: Cell) {
        super();
        this.brickObject = brickObject;
        this.cell = cell;
    }
    do(editor: EditorComponent) {
        const preDoBrickCells = editor.snapshotBrickCells();

        editor.buildBrickObject(this.brickObject, this.cell);

        editor.removeUnmovedBrickObject(preDoBrickCells);

        this.preDoBrickCells = preDoBrickCells;
    }
    undo(editor: EditorComponent) {
        editor.destroyBrickObject(this.brickObject);

        if (this.preDoBrickCells) {
            this.preDoBrickCells.forEach((value: Cell, key: BrickObject) => {
                editor.moveBrickObject(key, value);
            });
        }
    }
}
