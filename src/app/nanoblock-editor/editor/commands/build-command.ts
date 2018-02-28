import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent, BrickObject } from '../editor.component';

export class BuildCommand extends Command {
    brickObject: BrickObject;
    cell: Cell;

    constructor(brickObject: BrickObject, cell: Cell) {
        super();
        this.brickObject = brickObject;
        this.cell = cell;
    }
    do(editor: EditorComponent) {
        editor.buildBrickObject(this.brickObject, this.cell);
    }
    undo(editor: EditorComponent) {
        throw new Error('Method not implemented.');
    }
}
