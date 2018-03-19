import { EditorMode } from '../editor-mode';
import { EditorComponent, RotateDirection } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';
import { Vector3 } from 'three';
import THREE = require('three');

export class PaintEditorMode extends EditorMode {

    constructor(editor: EditorComponent) {
        super(editor);
        this.name = 'paint';
    }

    highlight(cell: Cell) {
    }

    select(cell: Cell) {
    }

    enter() {
    }

    exit() {
    }
}
