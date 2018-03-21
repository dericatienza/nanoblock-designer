import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';
import { BuildCommand } from './build-command';

export class EraseCommand extends Command {
    brickObject: BrickObject;
    cell: Cell;

    constructor(brickObject: BrickObject) {
        super();
        this.brickObject = brickObject;
        this.cell = brickObject.cell;
    }
    do(editor: EditorComponent) {
        editor.destroyBrickObject(this.brickObject);
    }
    undo(editor: EditorComponent) {
        editor.buildBrickObject(this.brickObject, this.cell);
    }
}
