import { EditorMode } from '../editor-mode';
import { EditorComponent } from '../editor.component';
import { Cell } from '../../objects/grid.directive';
import { BuildCommand } from '../commands/build-command';

export class BuildEditorMode extends EditorMode {

    highlight(cell: Cell) {
        this.editor.currentBrickObject.mesh.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);
    }

    select(cell: Cell) {
        if (this.editor.checkCellBuildable(this.editor.currentBrickObject, cell)) {
            this.buildBrick(cell);
            this.nextBrick(cell);
        } else {
            alert('Cells already occupied.');
        }
    }

    enter() {
        this.editor.createCurrentBrickObject();

        this.editor.currentBrickObject.mesh.position.set(1000, 1000, 1000);

        this.editor.setCurrentBrickOpacity();
    }

    exit() {
        this.editor.destroyCurrentBrickObject();
    }

    nextBrick(cell: Cell) {
        this.editor.createCurrentBrickObject();
        this.editor.setCurrentBrickOpacity();

        this.editor.currentBrickObject.mesh.position.set(cell.worldPosition.x, cell.worldPosition.y, cell.worldPosition.z);
    }

    buildBrick(cell: Cell) {
        this.editor.resetCurrentBrickOpacity();

        const command = new BuildCommand(this.editor.currentBrickObject, cell);
        this.editor.executeCommand(command);
    }
}
