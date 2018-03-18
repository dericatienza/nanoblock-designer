import { EditorMode } from '../editor-mode';
import { EditorComponent } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BrickObject } from '../brick-object';

export class SelectEditorMode extends EditorMode {
    highlight(cell: Cell) {
        const brickObject = this.getBrickObjectFromCell(cell);

        if (brickObject) {
            // Select indicator here
            // brickObject.mesh.renderOrder = 1;
            // brickObject.mesh.onBeforeRender = function (renderer) { renderer.clearDepth(); };
        }
    }
    select(cell: Cell) {
        // console.log(`Selected cell ${cell.x}, ${cell.y}, ${cell.z}`);
    }
    enter() {
        console.log('Entered select mode.');
    }
    exit() {
        console.log('Exited select mode.');
    }

    getBrickObjectFromCell(cell: Cell): BrickObject {
        const checkCells = [cell, this.editor.grid.getCellByIndex(cell.x, cell.y + 1, cell.z)];

        for (const checkCell of checkCells) {
            for (const brickObject of this.editor.brickObjects) {
                if (brickObject.cell === checkCell) {
                    return brickObject;
                }

                const cells = this.editor.getOccupiedCells(brickObject, brickObject.cell);

                if (cells.indexOf(checkCell) > -1) {
                    return brickObject;
                }
            }
        }

        return null;
    }
}
