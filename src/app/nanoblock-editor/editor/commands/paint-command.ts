import { Command } from '../command';
import { Cell } from '../../objects/grid.directive';
import { EditorComponent } from '../editor.component';
import { BrickObject } from '../brick-object';
import { BuildCommand } from './build-command';
import { BrickColor } from '../editor.models';

export class PaintCommand extends Command {
    brickObject: BrickObject;
    brickColor: BrickColor;

    private _oldBrickColor: BrickColor;

    constructor(brickObject: BrickObject, brickColor: BrickColor) {
        super();
        this.brickObject = brickObject;
        this.brickColor = brickColor;

        this._oldBrickColor = brickObject.brickColor;
    }
    do(editor: EditorComponent) {
        editor.paintBrickObject(this.brickObject, this.brickColor);
    }
    undo(editor: EditorComponent) {
        editor.paintBrickObject(this.brickObject, this._oldBrickColor);
    }
}
