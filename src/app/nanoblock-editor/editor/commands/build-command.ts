import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';

export class BuildCommand extends Command {
    cell: Cell;

    constructor(cell: Cell) {
        super();
        this.cell = cell;
    }
    do(editor: EditorComponent) {
        editor.currentBrickObject.mesh.position.set(this.cell.worldPosition.x, this.cell.worldPosition.y, this.cell.worldPosition.z);
    }
    undo(editor: EditorComponent) {
        throw new Error('Method not implemented.');
    }
}
