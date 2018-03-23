import { EditorMode } from '../editor-mode';
import { EditorComponent, RotateDirection } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';
import { Vector3 } from 'three';
import * as THREE from 'three';
import { SelectEditorMode } from './select-editor-mode';
import { EraseCommand } from '../commands/erase-command';

export class EraseEditorMode extends SelectEditorMode {

    constructor(editor: EditorComponent) {
        super(editor);
        this.name = 'erase';
    }

    select(cell: Cell) {
        const brickObject = this.editor.getBrickObjectFromCell(cell);

        if (brickObject) {
            const command = new EraseCommand(brickObject);

            this.editor.executeCommand(command);
        }
    }
}
