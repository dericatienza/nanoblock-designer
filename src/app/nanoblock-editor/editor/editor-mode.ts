import { EditorComponent } from './editor.component';
import { Cell } from '../objects/grid.directive';

export abstract class EditorMode {
    private _editor: EditorComponent;

    get editor(): EditorComponent {
        return this._editor;
    }

    constructor(editor: EditorComponent) {
        this._editor = editor;
    }

    abstract enter();
    abstract highlight(cell: Cell);
    abstract select(cell: Cell);
    abstract exit();
}
