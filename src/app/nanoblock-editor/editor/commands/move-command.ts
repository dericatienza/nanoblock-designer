import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';
import { BuildCommand } from './build-command';

export class MoveCommand extends BuildCommand {
    oldCell: Cell;

    constructor(brickObject: BrickObject, newCell: Cell, oldCell: Cell) {
        super(brickObject, newCell);
        this.oldCell = oldCell;
    }
    undo(editor: EditorComponent) {
        super.undo(editor);
        editor.buildBrickObject(this.brickObject, this.oldCell);
    }
}
