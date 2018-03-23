import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';
import { BuildCommand } from './build-command';
import { EraseCommand } from './erase-command';

export class RemoveCommand extends EraseCommand {

    constructor(brickObject: BrickObject) {
        super(brickObject);
    }
    do(editor: EditorComponent) {
        const preDoBrickCells = editor.snapshotBrickCells();

        editor.removeBrickObject(this.brickObject);

        editor.removeUnmovedBrickObject(preDoBrickCells);

        this.preDoBrickCells = preDoBrickCells;
    }
    undo(editor: EditorComponent) {
        editor.currentBrickColor = this.brickObject.brickColor;

        editor.refreshBrickColor(this.brickObject);

        super.undo(editor);

        editor.setMode('select');
    }
}
