import { EditorComponent } from './editor.component';
import { BrickObject } from './brick-object';
import { Cell } from '../objects/grid.directive';

export abstract class Command {
    preDoBrickCells: Map<BrickObject, Cell>;

    abstract do(editor: EditorComponent);
    abstract undo(editor: EditorComponent);
}
