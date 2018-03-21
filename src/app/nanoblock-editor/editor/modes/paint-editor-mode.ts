import { EditorMode } from '../editor-mode';
import { EditorComponent, RotateDirection } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';
import { Vector3 } from 'three';
import THREE = require('three');
import { SelectEditorMode } from './select-editor-mode';
import { PaintCommand } from '../commands/paint-command';

export class PaintEditorMode extends SelectEditorMode {

    constructor(editor: EditorComponent) {
        super(editor);
        this.name = 'paint';
    }

    select(cell: Cell) {
        const brickObject = this.editor.getBrickObjectFromCell(cell);

        if (brickObject && brickObject.brickColor !== this.editor.currentBrickColor) {
            const command = new PaintCommand(brickObject, this.editor.currentBrickColor);

            this.editor.executeCommand(command);
        }
    }
}
