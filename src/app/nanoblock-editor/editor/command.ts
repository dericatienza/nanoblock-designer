import { EditorComponent } from './editor.component';

export abstract class Command {
    abstract do(editor: EditorComponent);
    abstract undo(editor: EditorComponent);
}
