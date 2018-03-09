import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';

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
        editor.destroyBrickObject(this.brickObject);
    }
}
