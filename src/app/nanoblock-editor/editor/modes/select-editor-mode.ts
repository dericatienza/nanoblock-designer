import { EditorMode } from '../editor-mode';
import { EditorComponent } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BrickObject } from '../brick-object';

export class SelectEditorMode extends EditorMode {
    constructor(editor: EditorComponent) {
        super(editor);
        this.name = 'select';
    }

    highlight(cell: Cell) {
        const brickObject = this.editor.getBrickObjectFromCell(cell);

        if (brickObject) {
            this.editor.brickObjectHighlight.setHighlight(brickObject);
        } else {
            this.editor.brickObjectHighlight.removeHighlight();
        }
    }
    select(cell: Cell) {
        const brickObject = this.editor.getBrickObjectFromCell(cell);

        if (brickObject) {
            this.editor.selectBrickObject(brickObject);

            this.editor.setMode('build');
        }
    }
    enter() {

    }
    exit() {
        this.editor.brickObjectHighlight.removeHighlight();
    }
}
