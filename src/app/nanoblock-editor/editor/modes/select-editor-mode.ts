import { EditorMode } from '../editor-mode';
import { EditorComponent } from '../editor.component';
import { Cell } from '../../objects/grid.directive';

export class SelectEditorMode extends EditorMode {
    highlight(cell: Cell) {
        console.log(`Highlighted cell ${cell.x}, ${cell.y}, ${cell.z}`);
    }
    select(cell: Cell) {
        console.log(`Selected cell ${cell.x}, ${cell.y}, ${cell.z}`);
    }
    enter() {
        console.log('Entered select mode.');
    }
    exit() {
        console.log('Exited select mode.');
    }
}
