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
        const brickObject = this.getBrickObjectFromCell(cell);

        if (brickObject) {
            this.editor.brickObjectHighlight.setHighlight(brickObject);
        } else {
            this.editor.brickObjectHighlight.removeHighlight();
        }
    }
    select(cell: Cell) {
        // console.log(`Selected cell ${cell.x}, ${cell.y}, ${cell.z}`);
    }
    enter() {
        console.log('Entered select mode.');
    }
    exit() {
        this.editor.brickObjectHighlight.removeHighlight();
    }

    getBrickObjectFromCell(cell: Cell): BrickObject {
        const brickObjects = this.editor.getBrickObjectsByIndex(-1, cell.y, -1);

        for (const brickObject of brickObjects) {
            if (brickObject.cell === cell) {
                return brickObject;
            }

            const cells = this.editor.getOccupiedCells(brickObject, brickObject.cell);

            if (cells.indexOf(cell) > -1) {
                return brickObject;
            }
        }

        return null;
    }
}
